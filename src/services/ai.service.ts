import { injectable, inject } from "inversify";
import { TYPES } from "../constants/types";
import { DatabaseService} from './database.service';
import { Model } from "../entity/Image.entity";
import { StudyEvaluation } from "../entity/Study.entity";
import axios, { AxiosResponse } from 'axios';
import fs from 'fs';
import unzip from 'unzipper';
import { ModelViewModel } from "../interfaces/ModelViewModel";
import { AiFactory } from "../factories/ai.factory";
import * as Celery from 'celery-ts';
import {Docker} from 'node-docker-api';


@injectable()
export class AiService {
    docker = new Docker({ socketPath: '/var/run/docker.sock' });
    celeryClient = Celery.createClient({
        brokerUrl: 'amqp://rabbitmq',
        resultBackend: 'redis://redis'
    });

    modelRepository = this.db.getRepository<Model>(Model);
    evalRepository = this.db.getRepository<StudyEvaluation>(StudyEvaluation);

    constructor(
        @inject(TYPES.DatabaseService) private db: DatabaseService,
        @inject(TYPES.AiFatory) private aiFactory: AiFactory,

        ) {
    }

    async processDicom(modelId: number, studyId: string): Promise<any>{
        let model = await this.modelRepository.findOne({id: modelId});

        let filePath = await this.getStudyMedia(studyId);

        const task: Celery.Task<string> = this.celeryClient.createTask<string>('runner.evaluate_dicom');

        const result: Celery.Result<string> = task.applyAsync({
            args: [model.image, filePath],
            kwargs: {}
        })
        
        console.log(await result.get())
    }

    async getStudyMedia(studyId: string): Promise<string> {
        let url = `http://orthanc:8042/studies/${studyId}/media`
        let study = await axios.get(url, {responseType: 'arraybuffer'})

        let filePath = `/tmp/${studyId}.zip`;
        let outPath = `/tmp/${studyId}`;
        fs.writeFileSync(filePath, study.data);

        await new Promise((resolve, reject) => {
            let unzipped = fs.createReadStream(filePath).pipe(unzip.Extract({path: outPath}))

            unzipped.on('finish', resolve);
            unzipped.on('error', reject);
        })

        return outPath;
    }


    async registerModel(modelVM: ModelViewModel): Promise<ModelViewModel> {
        let model = this.aiFactory.buildModel(modelVM);

        let savedModel = await this.modelRepository.save(model);

        try {
            let container = await this.docker.container.create({
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
}