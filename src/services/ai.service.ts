import { injectable, inject } from "inversify";
import { TYPES } from "../constants/types";
import { DatabaseService} from './database.service';
import { Model } from "../entity/Model.entity";
import { StudyEvaluation } from "../entity/StudyEvaluation.entity";
import axios, { AxiosResponse } from 'axios';
import fs from 'fs';
import unzip from 'unzipper';
import { ModelViewModel } from "../interfaces/ModelViewModel";
import { AiFactory } from "../factories/ai.factory";
import * as Celery from 'celery-ts';
import Docker from 'dockerode';
import { EvaluationStatus } from "../enums/EvaluationStatus";
import { APP_SETTINGS } from "../constants/appSettings";
import { AppSettingsService } from "./appSettings.service";
import { EvalJobViewModel } from "../interfaces/EvalJobViewModel";
import { EvalJob } from "../entity/EvalJob.entity";
import * as _ from 'lodash';
import { EvalJobStatus } from "../enums/EvalJobStatus";
import { Study } from "../entity/Study.entity";

@injectable()
export class AiService {
    docker = new Docker({ socketPath: '/var/run/docker.sock' });
    celeryClient = Celery.createClient({
        brokerUrl: this.settingsService.getRabbitMqUrl(),
        resultBackend: this.settingsService.getRedisUrl()
    });

    modelRepository = this.db.getRepository<Model>(Model);
    evalRepository = this.db.getRepository<StudyEvaluation>(StudyEvaluation);
    jobRepository = this.db.getRepository<EvalJob>(EvalJob);
    studyRepository = this.db.getRepository<Study>(Study);


    constructor(
        @inject(TYPES.DatabaseService) private db: DatabaseService,
        @inject(TYPES.AiFatory) private aiFactory: AiFactory,
        @inject(TYPES.AppSettingsService) private settingsService: AppSettingsService,

        ) {
    }

    async processDicom(modelId: number, studyId: number): Promise<any>{
        let model = await this.modelRepository.findOne({id: modelId});

        let filePath = await this.getStudyMedia(studyId);

        const task: Celery.Task<string> = this.celeryClient.createTask<string>('runner.evaluate_dicom');

        let study = await this.evaluateStudy(model.id, studyId)

        task.applyAsync({
            args: [model.image, filePath, study.id],
            kwargs: {}
        })
        
        return {message: 'started task'}
    }

    async evaluateStudies(modelId: number) {
        console.log(`evaluating for ${modelId}`)
        const task: Celery.Task<string> = this.celeryClient.createTask<string>('runner.evaluate_studies');

        task.applyAsync({
            args: [modelId],
            kwargs: {}
        });

        return `started task for model ${modelId}`
    }

    async getStudyMedia(studyId: number): Promise<string> {
        let studyDb = await this.studyRepository.findOneOrFail({id: studyId})
        let orthancId = studyDb.orthancStudyId;

        let url = `${this.settingsService.getOrthancUrl()}/studies/${orthancId}/media`
        let study = await axios.get(url, {responseType: 'arraybuffer'})

        let filePath = `${this.settingsService.appSettings.imageSaveLocation}${orthancId}.zip`;
        let outPath = `${this.settingsService.appSettings.imageSaveLocation}${orthancId}`;
        fs.writeFileSync(filePath, study.data);

        await new Promise((resolve, reject) => {
            let unzipped = fs.createReadStream(filePath).pipe(unzip.Extract({path: outPath}))

            unzipped.on('finish', resolve);
            unzipped.on('error', reject);
        })

        return orthancId;
    }


    async registerModel(modelVM: ModelViewModel): Promise<ModelViewModel> {
        let model = this.aiFactory.buildModel(modelVM);

        let savedModel = await this.modelRepository.save(model);

        try {
            let container = await this.docker.createContainer({
                Image: model.image,
            });
        } catch {
            throw new Error('Can\'t find image');
        }

        return this.aiFactory.buildModelViewModel(savedModel);
    }

    async getModels(): Promise<ModelViewModel[]> {
        let models = await this.modelRepository.find();
        return models.map(m => this.aiFactory.buildModelViewModel(m));
    }

    async evaluateStudy(modelId: number, studyId: number): Promise<StudyEvaluation> {
        let study = this.aiFactory.buildStudy(modelId, studyId, EvaluationStatus.running);
        
        return this.evalRepository.save(study)
    }

    async getStudies(page: string, pageSize: string): Promise<{studies: Study[], total: number}> {
        let studies = await this.studyRepository.findAndCount({
            skip: +page,
            take: +pageSize
        });
        return {studies: studies[0], total: studies[1]};
    }

    async getEvals(page: number, pageSize: number): Promise<{evals: StudyEvaluation[], total: number}> {
        let evals = await this.evalRepository.findAndCount({
            relations: ['model', 'study'],
            skip: page,
            take: pageSize
        });
        return {evals: evals[0], total: evals[1]}
    }

    async startJob(jobVM: EvalJobViewModel): Promise<EvalJobViewModel> {
        let job = this.aiFactory.buildEvalJob(jobVM) 
        let jobDB = await this.jobRepository.save(job)
        let model = await this.modelRepository.findOneOrFail({id: job.model as number})
        return this.aiFactory.buildEvalJobVM(jobDB, model)
    }

    async getImages(): Promise<string[]> {
        let images = await this.docker.listImages()
        let imageNames = images.map(i => _.first(_.get(i, 'RepoTags'))).filter(i => !!i)
        let set = new Set(imageNames);

        return Array.from(set);
    }
    
    async getEvalJobs(): Promise<EvalJob[]> {
        let evalJobs = await this.jobRepository.find({relations: ['model']});

        return evalJobs
    }

    async killJob(jobId): Promise<EvalJob> {
        let job = await this.jobRepository.findOneOrFail({id: jobId});
        job.status = EvalJobStatus.stopped;
        return await this.jobRepository.save(job);
    }

    async setClassifier(modelName:string): Promise<ModelViewModel> {
        let classifier = await this.modelRepository.findOne({image: modelName});

        if(!classifier) {
            await this.modelRepository.save(this.aiFactory.buildModel({image: modelName, input: StudyType.di}))
        }

    }
}