import { controller, httpGet, httpPost, httpDelete } from "inversify-express-utils";
import { inject } from "inversify";
import { TYPES } from "../constants/types";
import { EvalService } from "../services/eval.service";
import { CutsomRequest } from "../interfaces/Request";
import { PagedResponse, StudyEvalVM } from "med-ai-common";
import * as _ from 'lodash';
import * as fs from 'fs';
import { Response } from "express";
import { Result } from "../interfaces/Results";


@controller('/evals')
export class EvalController {
    constructor(@inject(TYPES.EvalService) private evalService: EvalService) {}

    @httpGet('', TYPES.AuthMiddleware)
    public async getStudyEval(req: CutsomRequest<any>, res: Response): Promise<PagedResponse<StudyEvalVM>> {
        let searchString = _.get(req.query as _.Dictionary<string>, 'searchString', '')
        return this.evalService.getEvals(+req.query.page, +req.query.pageSize, searchString);
    }

    @httpGet('/:modelId/:studyId', TYPES.AuthMiddleware) 
    public async processDicom(req: CutsomRequest<any>, res: Response): Promise<{ message: string }> {
        return this.evalService.processDicom(+req.params.modelId, +req.params.studyId);
    }

    @httpGet('/logs', TYPES.AuthMiddleware)
    public async  getEvalLog(req: CutsomRequest<any>, res: Response) {
        return this.evalService.getEvalLog(+req.query.evalId)
    }

    @httpGet('/output-image', TYPES.AuthMiddleware)
    public async  getOutputImage(req: CutsomRequest<any>, res: Response) {
        let filePath = await this.evalService.getOutputImage(+req.query.evalId)
        return fs.readFileSync(`/opt/images/${filePath}`)
    }


    @httpDelete('/:id', TYPES.AuthMiddleware)
    public async deleteEval(req: CutsomRequest<StudyEvalVM>, res:Response) {
        return this.evalService.deleteEval(+req.params.id)
    }

}
