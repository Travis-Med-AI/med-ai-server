import { injectable, inject } from "inversify";
import { TYPES } from "../constants/types";
import { DatabaseService } from "./database.service";
import { Model } from "../entity/Model.entity";
import { ModelViewModel } from "../interfaces/ModelViewModel";
import Docker from "dockerode";
import { Classifier } from "../entity/Classifier.entity";
import { StudyType } from "../enums/StudyType";
import { ModelOutputs } from "../enums/ModelOutputs";
import { JobService } from "./job.service";
import { AiFactory } from "../factories/ai.factory";
import * as _ from 'lodash';

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

    async saveModel(model:Model): Promise<Model> {

        return 
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

        await this.jobService.saveEvalJob(model)

        return this.aiFactory.buildModelViewModel(savedModel);
    }

    async getModels(): Promise<ModelViewModel[]> {
        let models = await this.modelRepository.find();
        return models.map(m => this.aiFactory.buildModelViewModel(m));
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

    async getImages(): Promise<string[]> {
        let images = await this.docker.listImages()
        let imageNames = images.map(i => _.first(_.get(i, 'RepoTags'))).filter(i => !!i)
        let set = new Set(imageNames);

        return Array.from(set);
    }

}