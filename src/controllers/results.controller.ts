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


@controller('/results')
export class ResultsController {
    constructor(@inject(TYPES.EvalService) private evalService: EvalService) {}

    @httpGet('/:modelId/:date', TYPES.ResultMiddleware)
    public async getResultsByModel(req: CutsomRequest<any>, res: Response): Promise<Result[]> {
        return this.evalService.getResults(+req.params.modelId, +req.params.date);
    }

}
