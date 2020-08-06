import { controller, httpGet, httpPost, httpDelete } from "inversify-express-utils";
import { inject } from "inversify";
import { TYPES } from "../constants/types";
import { EvalService } from "../services/eval.service";
import { CutsomRequest } from "../interfaces/Request";
import { ModelViewModel } from "../interfaces/ModelViewModel";
import { StudyEvaluation } from "../entity/StudyEvaluation.entity";
import * as _ from 'lodash';
import * as fs from 'fs';
import { Response } from "express";


@controller('/evals')
export class EvalController {
    constructor(@inject(TYPES.EvalService) private evalService: EvalService) {}

    @httpGet('')
    public async getStudyEval(req: CutsomRequest<ModelViewModel>, res: Response): Promise<{evals: StudyEvaluation[], total: number}> {
        return this.evalService.getEvals(+req.query.page, +req.query.pageSize,  _.get(req.query, 'searchString', ''));
    }

    @httpGet('/:modelId/:studyId') 
    public async processDicom(req: CutsomRequest<any>, res: Response): Promise<any> {
        return this.evalService.processDicom(+req.params.modelId, +req.params.studyId);
    }

    @httpGet('/output-image')
    public async  getOutputImage(req: CutsomRequest<any>, res: Response) {
        let filePath = await this.evalService.getOutputImage(+req.query.evalId)
        return fs.readFileSync(`/tmp/${filePath}`)
    }

    @httpDelete('/:id')
    public async deleteEval(req: CutsomRequest<any>, res:Response) {
        return this.evalService.deleteEval(+req.params.id)
    }

}
