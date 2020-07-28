import { injectable, inject } from "inversify";
import { TYPES } from "../constants/types";
import { DatabaseService } from "./database.service";
import { Model } from "../entity/Model.entity";
import { ModelViewModel } from "../interfaces/ModelViewModel";
import Docker from "dockerode";
import { Classifier } from "../entity/Classifier.entity";
import { JobService } from "./job.service";
import { AiFactory } from "../factories/ai.factory";
import * as _ from 'lodash';
import { Modality } from "../enums/Modality";
import { ModelManifestItem } from "../interfaces/ModelManifestItem";
import { ModelManifest } from "../constants/model.manifest";
import  {exec} from 'child_process'
import {promisify} from 'util';

@injectable()
export class ModelService {
    docker = new Docker({ socketPath: '/var/run/docker.sock' });

    modelRepository = this.db.getRepository<Model>(Model);
    classifierRepository = this.db.getRepository<Classifier>(Classifier);

    constructor(
        @inject(TYPES.DatabaseService) private db: DatabaseService,
        @inject(TYPES.JobService) private jobService: JobService,
        @inject(TYPES.AiFatory) private aiFactory: AiFactory
    ) {}

    async getModel(modelId: number): Promise<Model> {
        return this.modelRepository.findOne({id: modelId});
    }

    async registerModel(modelManifest: ModelManifestItem): Promise<ModelViewModel> {
        let savedModel = await this.saveModel(modelManifest);
        return this.aiFactory.buildModelViewModel(savedModel);
    }

    async saveModel(modelManifest: ModelManifestItem): Promise<Model> {
        let model = this.aiFactory.buildModel(modelManifest);

        // pull image from dockerhub
        exec(`docker pull ${model.image}`, (error, stdout, stderr) => {
            if(error){
                this.modelRepository.update({image: model.image}, {pulled: false, failed: true})
            } else {
                this.modelRepository.update({image: model.image}, {pulled: true, failed: false})
            }
        })

        let savedModel = await this.modelRepository.save(model);

        await this.jobService.saveEvalJob(model)
        return savedModel
    }

    async getModels(): Promise<ModelViewModel[]> {
        let models = await this.modelRepository.find();
        return models.map(m => this.aiFactory.buildModelViewModel(m));
    }

    async setClassifier(modelName:string, modality: Modality): Promise<ModelViewModel> {
        let classifier = await this.classifierRepository.findOne({modality});
        let model = await this.modelRepository.findOne({image: modelName, modality})

        if(model == undefined) {
            let manifestItem = _.find(ModelManifest, m => m.tag === modelName)
            model = await this.saveModel(manifestItem)
        } 

        if(!classifier) {
            let classifer = this.aiFactory.buildClassifier(model);
            await this.classifierRepository.save(classifer);
        } else {
            await this.classifierRepository.update({ id: classifier.id }, { model })
        }

        return this.aiFactory.buildModelViewModel(model);
    }
    
    async getClassifiers() {
        let classifiers = await this.classifierRepository.find();
        return classifiers;
    }

    async getImages(): Promise<string[]> {
        let images = await this.docker.listImages()
        let imageNames = images.map(i => _.first(_.get(i, 'RepoTags'))).filter(i => !!i)
        let set = new Set(imageNames);

        return Array.from(set);
    }

    async getDownloadableModels (): Promise<ModelManifestItem[]> {
        let models = await this.modelRepository.find()

        let filteredManifest = _.filter(ModelManifest, mm => _.findIndex(models, (m:Model) => m.image === mm.tag) === -1)

        return filteredManifest;
    }
}