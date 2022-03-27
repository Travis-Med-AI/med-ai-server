import { controller, httpDelete, httpGet, httpPost, request, response } from "inversify-express-utils";
import { inject } from "inversify";
import { TYPES } from "../constants/types";
import { CutsomRequest } from "../interfaces/Request";
import * as _ from 'lodash';
import { JobService } from "../services/job.service";
import { EvalJob } from "../entity/EvalJob.entity";
import { Response } from "express";
import { EvalJobViewModel, ExperimentStatsViewModel, ExperimentViewModel, PagedResponse, StudyType, StudyViewModel } from "med-ai-common";
import { ExperimentService } from "../services/experiment.service";
import { Experiment } from "../entity/Experiment.entity";
import fs from 'fs';


@controller('/experiments')
export class ExperimentController {
    constructor(@inject(TYPES.ExperimentService) private experimentService: ExperimentService) {}

    @httpGet('', TYPES.AuthMiddleware)
    public async getEvalJobs(req: CutsomRequest<any>, res: Response): Promise<ExperimentViewModel[]> {
        return this.experimentService.getExperiments(req.user);
    }

    @httpGet('/studies', TYPES.AuthMiddleware)
    public async getExperimentStudies(req: CutsomRequest<{id:number}>, res: Response): Promise<PagedResponse<StudyViewModel>> {
        return this.experimentService.getExperimentStudies(+_.get(req.query as _.Dictionary<string>, 'id'),
                                                            req.user,
                                                           +_.get(req.query as _.Dictionary<string>, 'page'), 
                                                           +_.get(req.query as _.Dictionary<string>, 'pageSize'),
                                                           _.get(req.query as _.Dictionary<StudyType>, 'studyType')); 
    }

    @httpGet('/unused-studies', TYPES.AuthMiddleware)
    public async getUnusedStudies(req: CutsomRequest<{id:number}>, res: Response): Promise<PagedResponse<StudyViewModel>> {
        return this.experimentService.getUnusedStudies(+_.get(req.query as _.Dictionary<string>, 'id'),
                                                        req.user,
                                                           +_.get(req.query as _.Dictionary<string>, 'page'), 
                                                           +_.get(req.query as _.Dictionary<string>, 'pageSize'), 
                                                           _.get(req.query as _.Dictionary<string>, 'searchString', ''),
                                                           _.get(req.query as _.Dictionary<StudyType>, 'studyType'),
                                                           _.get(req.query as _.Dictionary<string>, 'modality')); 
    }

    @httpPost('', TYPES.AuthMiddleware)
    public async addExperiment(req: CutsomRequest<{name: string, type: StudyType}>, res: Response): Promise<ExperimentViewModel[]> {
        return this.experimentService.addExperiment(req.body.name, req.body.type, req.user)
    }

    @httpPost('/studies', TYPES.AuthMiddleware)
    public async addStudiesToExperiment(req: CutsomRequest<{experimentId: number, studies: number[]}>, res: Response): Promise<PagedResponse<StudyViewModel>> {
        return this.experimentService.addStudiesToExperiment(req.body.experimentId, req.body.studies, req.user)
    }

    @httpPost('/all-studies', TYPES.AuthMiddleware)
    public async addAllToExperiment(req: CutsomRequest<{id: number, searchString: string, studyType: StudyType, modality: string}>, res: Response): Promise<any> {
        return this.experimentService.addAllToExperiment(_.get(req.body, 'id'),
                                                         req.user,
                                                         _.get(req.body, 'searchString', ''),
                                                         _.get(req.body, 'studyType'),
                                                         _.get(req.body, 'modality'))
    }

    @httpPost('/start', TYPES.AuthMiddleware)
    public async startExperiment(req: CutsomRequest<{experimentId: number, modelId: number}>, res: Response): Promise<ExperimentViewModel> {
        return this.experimentService.startExperiment(req.body.experimentId, req.body.modelId, req.user);
    }

    @httpPost('/stop', TYPES.AuthMiddleware)
    public async stopExperiment(req: CutsomRequest<{experimentId: number}>, res: Response): Promise<ExperimentViewModel> {
        return this.experimentService.stopExperiment(req.body.experimentId, req.user);
    }

    @httpDelete('/:id', TYPES.AuthMiddleware)
    public async deleteExperiment(req: CutsomRequest<any>, res: Response): Promise<ExperimentViewModel> {
        return this.experimentService.deleteExperiment(+req.params.id, req.user);
    }

    @httpGet('/results', TYPES.AuthMiddleware)
    public async getResults(@request() req: CutsomRequest<any>, @response() res: Response) {
        let csv = await this.experimentService.downloadResults(+_.get(req.query as _.Dictionary<string>, 'id'), req.user)
        res.header('Content-Type', 'text/csv');
        res.attachment('results.csv');
        
        res.send(csv);
    }

    @httpPost('/experiment-stats', TYPES.AuthMiddleware)
    public async  getEvalStats(req: CutsomRequest<{experimentId:number}>, res: Response): Promise<ExperimentStatsViewModel> {
        return this.experimentService.getExperimentStats(req.body.experimentId, req.user)
    }
}