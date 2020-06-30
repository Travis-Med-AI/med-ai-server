import { controller, httpGet, httpPost } from "inversify-express-utils";
import { inject } from "inversify";
import { TYPES } from "../constants/types";
import { CutsomRequest } from "../interfaces/Request";
import * as _ from 'lodash';
import { ModelService } from "../services/model.service";
import { ModelViewModel } from "../interfaces/ModelViewModel";
import { Response } from "express";
import { Modality } from "../enums/Modality";
import { Classifier } from "../entity/Classifier.entity";


@controller('/models')
export class ModelController {
    constructor(@inject(TYPES.ModelService) private modelService: ModelService) {}

    @httpGet('')
    public async getModels(req: CutsomRequest<any>, res: Response): Promise<ModelViewModel[]> {
        return this.modelService.getModels();
    }

    @httpGet('/images')
    public async getImages(req: CutsomRequest<any>, res: Response): Promise<string[]> {
        return this.modelService.getImages();
    }

    @httpPost('/register')
    public async registerModel(req: CutsomRequest<ModelViewModel>, res: Response): Promise<ModelViewModel> {
        return this.modelService.registerModel(req.body)
    }

    @httpPost('/classifier')
    public async setClassifier(req: CutsomRequest<{image: string, modality: Modality}>, res: Response): Promise<ModelViewModel> {
        return this.modelService.setClassifier(req.body.image, req.body.modality);
    }

    @httpGet('/classifiers')
    public async getClassifier(req: CutsomRequest<any>, res: Response): Promise<Classifier[]> {
        return this.modelService.getClassifiers();
    }

}