import { injectable, inject } from "inversify";
import { TYPES } from "../constants/types";
import { DatabaseService } from "./database.service";
import { Model } from "../entity/Model.entity";
import { ModelViewModel, Modality, ModelManifestItem, ClassifierViewModel, Notifications } from "med-ai-common";
import Docker from "dockerode";
import { Classifier } from "../entity/Classifier.entity";
import { JobService } from "./job.service";
import * as _ from 'lodash';
import { ModelManifest } from "../constants/model.manifest";
import { exec } from 'child_process'
import { createInterface } from 'readline';
import { EvalFactory } from "../factories/eval.factory";
import { ModelFactory } from "../factories/model.factory";
import { RealtimeService } from "./realtime.service";
import { RealtimeFactory } from "../factories/realtime.factory";
import { User } from "../entity/User.entity";

@injectable()
export class ModelService {
    docker = new Docker({ socketPath: '/var/run/docker.sock' });

    modelRepository = this.db.getRepository<Model>(Model);
    classifierRepository = this.db.getRepository<Classifier>(Classifier);

    constructor(
        @inject(TYPES.DatabaseService) private db: DatabaseService,
        @inject(TYPES.JobService) private jobService: JobService,
        @inject(TYPES.EvalFactory) private evalFactory: EvalFactory,
        @inject(TYPES.ModelFactory) private modelFactory: ModelFactory,
        @inject(TYPES.RealtimeService) private realtimeService: RealtimeService,
        @inject(TYPES.RealtimeFactory) private realtimeFactory: RealtimeFactory,
    ) {}

    async getModel(modelId: number, user: User): Promise<Model> {
        return this.modelRepository.findOneOrFail({id: modelId, user: user.id});
    }

    async registerModel(modelManifest: ModelManifestItem, user: User): Promise<ModelViewModel> {
        let savedModel = await this.saveModel(modelManifest, user);
        return this.modelFactory.buildModelViewModel(savedModel);
    }

    async saveModel(modelManifest: ModelManifestItem, user: User): Promise<Model> {
        let model = this.modelFactory.buildModel(modelManifest, user.id);

        try {
            console.log('downloading model')
            this.realtimeService.sendNotification(`Successfully downloaded ${model.image}`, 
                                                  Notifications.modelReady,
                                                  user.id)

            let savedModel = await this.modelRepository.save(model);
            await this.modelRepository.update({image: model.image, user: user.id}, {pulled: true, failedPull: false})

            await this.jobService.saveEvalJob(model, user)
            return savedModel
        } catch (e) {
            throw new Error(e)
        }

    }

    async getModels(user: User): Promise<ModelViewModel[]> {
        let models = await this.modelRepository.find({user: user.id});
        return models.map(m => this.modelFactory.buildModelViewModel(m));
    }

    async setClassifier(modelName:string, modality: Modality, user: User): Promise<ModelViewModel> {
        let classifier = await this.classifierRepository.findOne({modality, user: user.id});
        let model = await this.modelRepository.findOne({image: modelName, user: user.id})

        if(model == undefined) {
            let manifestItem = _.find(ModelManifest, m => m.tag === modelName)
            model = await this.saveModel(manifestItem, user)
        } 

        if(!classifier) {
            let classifer = this.modelFactory.buildClassifier(model, user.id);
            await this.classifierRepository.save(classifer);
        } else {
            await this.classifierRepository.update({ id: classifier.id, user: user.id }, { model })
        }

        return this.modelFactory.buildModelViewModel(model);
    }
    
    async getClassifiers(user: User): Promise<any[]> {
        let classifiers = await this.classifierRepository.find({user: user.id});
        return classifiers;
    }

    async setModality(modelId: number, modality: Modality): Promise<ModelViewModel> {
        await this.modelRepository.update({id:modelId}, {modality});
        let model = await this.modelRepository.findOne({id: modelId})
        
        return this.modelFactory.buildModelViewModel(model);
    }

    async getImages(): Promise<string[]> {
        let images = await this.docker.listImages()
        let imageNames = images.map(i => _.first(_.get(i, 'RepoTags'))).filter(i => !!i)
        let set = new Set(imageNames);

        return Array.from(set);
    }

    async getDownloadableModels (user: User): Promise<ModelManifestItem[]> {
        let models = await this.modelRepository.find({user: user.id})

        let filteredManifest = _.filter(ModelManifest, mm => _.findIndex(models, (m:Model) => m.image === mm.tag) === -1)

        return filteredManifest;
    }

    async retryModelDownload(image: string, user: User): Promise<ModelViewModel> {
        let manifest = _.find(ModelManifest, mi => mi.tag === image);
        let model = await this.modelRepository.findOne({image: manifest.tag, user: user.id});

        await this.jobService.deleteEvalJobByModelId(model.id, user);
        await this.modelRepository.delete({image: manifest.tag, user: user.id});
        return this.registerModel(manifest, user);
    }

    async deleteModel(modelId: number, user: User): Promise<any> {
        return await this.modelRepository.delete({id: modelId, user: user.id})
    }


}