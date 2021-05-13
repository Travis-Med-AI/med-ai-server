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

    async getModel(modelId: number): Promise<Model> {
        return this.modelRepository.findOneOrFail({id: modelId});
    }

    async registerModel(modelManifest: ModelManifestItem): Promise<ModelViewModel> {
        let savedModel = await this.saveModel(modelManifest);
        return this.modelFactory.buildModelViewModel(savedModel);
    }

    async saveModel(modelManifest: ModelManifestItem): Promise<Model> {
        let model = this.modelFactory.buildModel(modelManifest);

        try {
            // pull image from dockerhub
            let pull = exec(`docker pull ${model.image}`, (err, stdout) => {
                if(err) {
                    console.warn(err)
                    this.modelRepository.update({image: model.image}, {pulled: false, failed: true})
                } else {
                    console.log(stdout)
                    this.modelRepository.update({image: model.image}, {pulled: true, failed: false})
                    .then(out => {
                        this.realtimeService.sendNotification(`Successfully downloaded ${model.image}`, Notifications.modelReady)
                    })
                }

            })

            let savedModel = await this.modelRepository.save(model);

            await this.jobService.saveEvalJob(model)
            return savedModel
        } catch (e) {
            throw new Error(e)
        }

    }

    async getModels(): Promise<ModelViewModel[]> {
        let models = await this.modelRepository.find();
        return models.map(m => this.modelFactory.buildModelViewModel(m));
    }

    async setClassifier(modelName:string, modality: Modality): Promise<ModelViewModel> {
        let classifier = await this.classifierRepository.findOne({modality});
        let model = await this.modelRepository.findOne({image: modelName, modality})

        if(model == undefined) {
            let manifestItem = _.find(ModelManifest, m => m.tag === modelName)
            model = await this.saveModel(manifestItem)
        } 

        if(!classifier) {
            let classifer = this.modelFactory.buildClassifier(model);
            await this.classifierRepository.save(classifer);
        } else {
            await this.classifierRepository.update({ id: classifier.id }, { model })
        }

        return this.modelFactory.buildModelViewModel(model);
    }
    
    async getClassifiers(): Promise<any[]> {
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

    async retryModelDownload(image: string): Promise<ModelViewModel> {
        let manifest = _.find(ModelManifest, mi => mi.tag === image);
        let model = await this.modelRepository.findOne({image: manifest.tag});

        await this.jobService.deleteEvalJobByModelId(model.id);
        await this.modelRepository.delete({image: manifest.tag});
        return this.registerModel(manifest);
    }

    async deleteModel(modelId: number): Promise<any> {
        return await this.modelRepository.delete({id: modelId})
    }


    async toggleQuickstart(modelId: number): Promise<ModelViewModel> {
        let model = await this.modelRepository.findOne({id: modelId});
        model.quickStart = !model.quickStart
        model = await this.modelRepository.save(model)
        return this.modelFactory.buildModelViewModel(model)
    }
}