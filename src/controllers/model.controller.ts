import { controller, httpGet, httpPost, httpDelete } from "inversify-express-utils";
import { inject } from "inversify";
import { TYPES } from "../constants/types";
import { CutsomRequest } from "../interfaces/Request";
import * as _ from 'lodash';
import { ModelService } from "../services/model.service";
import { Modality, ModelViewModel } from "med-ai-common";
import { Response } from "express";
import { ModelManifestItem, ClassifierViewModel } from "med-ai-common";
import { EvalService } from "../services/eval.service";
import { Result } from "../interfaces/Results";


@controller('/models')
export class ModelController {
    constructor(@inject(TYPES.ModelService) private modelService: ModelService,
                @inject(TYPES.EvalService) private evalService: EvalService) {}

    @httpGet('', TYPES.AuthMiddleware)
    public async getModels(req: CutsomRequest<any>, res: Response): Promise<ModelViewModel[]> {
        return this.modelService.getModels();
    }

    @httpGet('/:modelId/:date', TYPES.ResultMiddleware)
    public async getResultsByModel(req: CutsomRequest<any>, res: Response): Promise<Result[]> {
        return this.evalService.getResults(+req.params.modelId, +req.params.date);
    }

    @httpDelete('/:id', TYPES.AuthMiddleware)
    public async deleteModel(req: CutsomRequest<any>, res: Response): Promise<any> {
        return this.modelService.deleteModel(+req.params.id);
    }

    @httpGet('/images', TYPES.AuthMiddleware)
    public async getImages(req: CutsomRequest<any>, res: Response): Promise<string[]> {
        return this.modelService.getImages();
    }

    @httpGet('/available', TYPES.AuthMiddleware)
    public async getDownloadableImages(req: CutsomRequest<any>, res: Response): Promise<ModelManifestItem[]> {
        return this.modelService.getDownloadableModels();
    }

    @httpPost('/register', TYPES.AuthMiddleware)
    public async registerModel(req: CutsomRequest<any>, res: Response): Promise<ModelViewModel> {
        return this.modelService.registerModel(req.body)
    }

    @httpPost('/retry', TYPES.AuthMiddleware)
    public async retryDownload(req: CutsomRequest<ModelViewModel>, res: Response): Promise<ModelViewModel> {
        return this.modelService.retryModelDownload(req.body.image)
    }

    @httpPost('/classifier', TYPES.AuthMiddleware)
    public async setClassifier(req: CutsomRequest<ModelViewModel>, res: Response): Promise<ModelViewModel> {
        return this.modelService.setClassifier(req.body.image, req.body.modality);
    }

    @httpGet('/classifiers', TYPES.AuthMiddleware)
    public async getClassifier(req: CutsomRequest<any>, res: Response): Promise<ClassifierViewModel[]> {
        return this.modelService.getClassifiers();
    }

    @httpPost('/modality', TYPES.AuthMiddleware)
    public async updateModality(req: CutsomRequest<{modelId: number, modality: Modality}>, res: Response): Promise<ModelViewModel> {
        return this.modelService.setModality(req.body.modelId, req.body.modality)
    }
}