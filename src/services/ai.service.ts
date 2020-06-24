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
import { StudyType } from "../enums/StudyType";
import { ModelOutputs } from "../enums/ModelOutputs";
import { Classifier } from "../entity/Classifier.entity";
import { Like, IsNull } from "typeorm";

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
    classifierRepository = this.db.getRepository<Classifier>(Classifier);


    constructor(
        @inject(TYPES.DatabaseService) private db: DatabaseService,
        @inject(TYPES.AiFatory) private aiFactory: AiFactory,
        @inject(TYPES.AppSettingsService) private settingsService: AppSettingsService,

        ) {
    }

    async processDicom(modelId: number, studyId: number): Promise<any>{
        let model = await this.modelRepository.findOne({id: modelId});
        let study = await this.studyRepository.findOne({id: studyId})

        const task: Celery.Task<string> = this.celeryClient.createTask<string>('runner.evaluate_dicom');

        let evaluation = await this.evaluateStudy(model.id, studyId)

        task.applyAsync({
            args: [model.image, study.orthancStudyId, evaluation.id],
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


    async registerModel(modelVM: ModelViewModel): Promise<ModelViewModel> {
        let model = this.aiFactory.buildModel(modelVM);
        let evalJob = this.aiFactory.buildEvalJob(model, false)


        try {
            let container = await this.docker.createContainer({
                Image: model.image,
            });
        } catch {
            throw new Error('Can\'t find image');
        }

        let savedModel = await this.modelRepository.save(model);
        await this.jobRepository.save(evalJob)

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

    async getStudies(page: string, pageSize: string, searchString: string): Promise<{studies: Study[], total: number}> {
        let studies = await this.studyRepository.findAndCount({
            skip: +page,
            take: +pageSize,
            where: [
                {patientId: Like(`%${searchString}%`)},
                {orthancStudyId: Like(`%${searchString}%`)},
                {type: Like(`%${searchString}%`)},
            ]
        }, );

        return {studies: studies[0], total: studies[1]};
    }

    async getEvals(page: number, pageSize: number, searchString: string): Promise<{evals: StudyEvaluation[], total: number}> {
        let query = this.evalRepository.createQueryBuilder('eval')
        .innerJoinAndSelect('eval.study', 'study')
        .innerJoinAndSelect('eval.model', 'model')
        .where('study.patientId like :patientId', {patientId: `%${searchString}%`})
        .orWhere('study.orthancStudyId like :orthancId', {orthancId: `%${searchString}%`})
        .skip(page)
        .take(pageSize)

        let evals = await query.getManyAndCount()

        return {evals: evals[0], total: evals[1]}
    }

    async startJob(jobId: number): Promise<{updated: number}> {
        let jobDB = await this.jobRepository.update({id: jobId}, {running: true})
        return { updated: jobDB.affected }
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
        job.running = false;
        return await this.jobRepository.save(job);
    }

    async setClassifier(modelName:string): Promise<ModelViewModel> {
        let classifier = await this.classifierRepository.findOne();
        let model = await this.modelRepository.findOne({image: modelName})

        if(!model) {

            let dbModel: ModelViewModel = {image: modelName, input: StudyType.dicom, output: ModelOutputs.studyType, hasImageOutput: false}
            model = await this.modelRepository.save(this.aiFactory.buildModel(dbModel))
        } 

        if(!classifier) {
            let classifer = this.aiFactory.buildClassifier(model);
            await this.classifierRepository.save(classifer);
        } else {
            await this.classifierRepository.update({ id: classifier.id }, { model })
        }

        return this.aiFactory.buildModelViewModel(model);
    }

    async getClassifier() {
        let classifier = await this.classifierRepository.findOne();
        return {image: classifier.model.image}
    }

    async getOrthancStudyCount() {
        let studies = await axios.get(`${this.settingsService.getOrthancUrl()}/studies`)

        return {count: studies.data.length}
    }

    async getOutputImage(evalId: number) {
        let evaluation = await this.evalRepository.findOne({id:evalId})
        console.log('image path is ', evaluation.imgOutputPath)

        return evaluation.imgOutputPath;
    }
}