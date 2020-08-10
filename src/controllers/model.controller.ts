import { controller, httpGet, httpPost } from "inversify-express-utils";
import { inject } from "inversify";
import { TYPES } from "../constants/types";
import { CutsomRequest } from "../interfaces/Request";
import * as _ from 'lodash';
import { ModelService } from "../services/model.service";
import { ModelViewModel } from "med-ai-common";
import { Response } from "express";
import { ModelManifestItem, ClassifierViewModel } from "med-ai-common";


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

    @httpGet('/available')
    public async getDownloadableImages(req: CutsomRequest<any>, res: Response): Promise<ModelManifestItem[]> {
        return this.modelService.getDownloadableModels();
    }

    @httpPost('/register')
    public async registerModel(req: CutsomRequest<any>, res: Response): Promise<ModelViewModel> {
        return this.modelService.registerModel(req.body)
    }

    @httpPost('/retry')
    public async retryDownload(req: CutsomRequest<ModelViewModel>, res: Response): Promise<ModelViewModel> {
        return this.modelService.retryModelDownload(req.body.image)
    }

    @httpPost('/classifier')
    public async setClassifier(req: CutsomRequest<ModelViewModel>, res: Response): Promise<ModelViewModel> {
        return this.modelService.setClassifier(req.body.image, req.body.modality);
    }

    @httpGet('/classifiers')
    public async getClassifier(req: CutsomRequest<any>, res: Response): Promise<ClassifierViewModel[]> {
        return this.modelService.getClassifiers();
    }

}