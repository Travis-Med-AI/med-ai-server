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
import * as _ from 'lodash';
import * as fs from 'fs';

@controller('/ai')
export class AiController {
    constructor(@inject(TYPES.AiService) private aiService: AiService) {}

    @httpGet('/:modelId/:studyId') 
    public async processDicom(req: CutsomRequest<any>, res: Response): Promise<any> {
        return this.aiService.processDicom(+req.params.modelId, +req.params.studyId);
    }

    @httpGet('/output-image')
    public async  getOutputImage(req: CutsomRequest<any>, res: Response) {
        let filePath = await this.aiService.getOutputImage(+req.query.evalId)
        return fs.readFileSync(filePath)
    }

    @httpGet('/models')
    public async getModels(req: CutsomRequest<any>, res: Response): Promise<ModelViewModel[]> {
        return this.aiService.getModels();
    }

    @httpGet('/studies')
    public async getPatients(req: CutsomRequest<any>, res: Response): Promise<{studies: Study[], total: number}> {
        return this.aiService.getStudies(req.query.page, req.query.pageSize, _.get(req.query, 'searchString', ''));
    }

    @httpGet('/evals')
    public async getStudyEval(req: CutsomRequest<ModelViewModel>, res: Response): Promise<{evals: StudyEvaluation[], total: number}> {
        return this.aiService.getEvals(+req.query.page, +req.query.pageSize,  _.get(req.query, 'searchString', ''));
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
    public async startJob(req: CutsomRequest<{id:number}>, res: Response): Promise<{updated: number}> {
        return this.aiService.startJob(req.body.id);
    }

    @httpPost('/kill-job')
    public async killJob(req: CutsomRequest<{id: number}>, res: Response): Promise<EvalJob> {
        return this.aiService.killJob(req.body.id);
    }

    @httpPost('/set-classifier')
    public async setClassifier(req: CutsomRequest<{image: string}>, res: Response): Promise<ModelViewModel> {
        return this.aiService.setClassifier(req.body.image);
    }

    @httpGet('/classifier')
    public async getClassifier(req: CutsomRequest<any>, res: Response): Promise<{image: string}> {
        return this.aiService.getClassifier();
    }

    @httpGet('/orthanc-count')
    public async getOrhtancStudyCount(req: CutsomRequest<any>, res: Response): Promise<{count: number}> {
        return this.aiService.getOrthancStudyCount();
    }


}
