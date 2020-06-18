import {
    controller, httpGet, httpPost
  } from 'inversify-express-utils';
import { Response } from 'express';
import { inject } from 'inversify';
import { TYPES } from '../constants/types';
import { CutsomRequest } from '../interfaces/Request';
import { AiService } from '../services/ai.service';
import { ModelViewModel } from '../interfaces/ModelViewModel';
import { EvalJobViewModel } from '../interfaces/EvalJobViewModel';
import { EvalJob } from '../entity/EvalJob.entity';
import { StudyEvaluation } from '../entity/StudyEvaluation.entity';
import { Study } from '../entity/Study.entity';
import { Model } from '../entity/Model.entity';

@controller('/ai')
export class AiController {
    constructor(@inject(TYPES.AiService) private aiService: AiService) {}

    @httpGet('/:modelId/:studyId') 
    public async processDicom(req: CutsomRequest<any>, res: Response): Promise<any> {
        return this.aiService.processDicom(+req.params.modelId, +req.params.studyId);
    }

    @httpGet('/models')
    public async getModels(req: CutsomRequest<any>, res: Response): Promise<ModelViewModel[]> {
        return this.aiService.getModels();
    }

    @httpGet('/studies')
    public async getPatients(req: CutsomRequest<any>, res: Response): Promise<{studies: Study[], total: number}> {
        return this.aiService.getStudies(req.query.page, req.query.pageSize);
    }

    @httpGet('/evals')
    public async getStudyEval(req: CutsomRequest<ModelViewModel>, res: Response): Promise<{evals: StudyEvaluation[], total: number}> {
        return this.aiService.getEvals(+req.query.page, +req.query.pageSize);
    }

    @httpGet('/images')
    public async getImages(req: CutsomRequest<any>, res: Response): Promise<string[]> {
        return this.aiService.getImages();
    }

    @httpGet('/eval-jobs')
    public async getEvalJobs(req: CutsomRequest<any>, res: Response): Promise<EvalJob[]> {
        return this.aiService.getEvalJobs();
    }

    @httpPost('/evaluate')
    public async evaluate(req: CutsomRequest<{id: 1}>, res: Response): Promise<any> {
        console.log(req.body.id)
        return this.aiService.evaluateStudies(+req.body.id);
    }

    @httpPost('/register-model')
    public async registerModel(req: CutsomRequest<ModelViewModel>, res: Response): Promise<ModelViewModel> {
        return this.aiService.registerModel(req.body)
    }

    @httpPost('/start-job')
    public async startJob(req: CutsomRequest<EvalJobViewModel>, res: Response): Promise<EvalJobViewModel> {
        return this.aiService.startJob(req.body);
    }

    @httpPost('/kill-job')
    public async killJob(req: CutsomRequest<{id: number}>, res: Response): Promise<EvalJob> {
        return this.aiService.killJob(req.body.id);
    }

    @httpPost('/set-classifier')
    public async setClassifier(req: CutsomRequest<{model: string}>, res: Response): Promise<ModelViewModel> {
        return this.aiService.setClassifier(req.body.model)
    }



}
