import { controller, httpDelete, httpGet, httpPost, request, response } from "inversify-express-utils";
import { inject } from "inversify";
import { TYPES } from "../constants/types";
import { CutsomRequest } from "../interfaces/Request";
import * as _ from 'lodash';
import { JobService } from "../services/job.service";
import { EvalJob } from "../entity/EvalJob.entity";
import { Response } from "express";
import { EvalJobViewModel, ExperimentViewModel, PagedResponse, StudyType, StudyViewModel } from "med-ai-common";
import { ExperimentService } from "../services/experiment.service";
import { Experiment } from "../entity/Experiment.entity";
import fs from 'fs';


@controller('/experiments')
export class ExperimentController {
    constructor(@inject(TYPES.ExperimentService) private experimentService: ExperimentService) {}

    @httpGet('')
    public async getEvalJobs(req: CutsomRequest<any>, res: Response): Promise<ExperimentViewModel[]> {
        return this.experimentService.getExperiments();
    }

    @httpGet('/studies')
    public async getExperimentStudies(req: CutsomRequest<{id:number}>, res: Response): Promise<PagedResponse<StudyViewModel>> {
        return this.experimentService.getExperimentStudies(+_.get(req.query as _.Dictionary<string>, 'id'),
                                                           +_.get(req.query as _.Dictionary<string>, 'page'), 
                                                           +_.get(req.query as _.Dictionary<string>, 'pageSize'),
                                                           _.get(req.query as _.Dictionary<StudyType>, 'studyType')); 
    }

    @httpGet('/unused-studies')
    public async getUnusedStudies(req: CutsomRequest<{id:number}>, res: Response): Promise<PagedResponse<StudyViewModel>> {
        return this.experimentService.getUnusedStudies(+_.get(req.query as _.Dictionary<string>, 'id'),
                                                           +_.get(req.query as _.Dictionary<string>, 'page'), 
                                                           +_.get(req.query as _.Dictionary<string>, 'pageSize'), 
                                                           _.get(req.query as _.Dictionary<string>, 'searchString', ''),
                                                           _.get(req.query as _.Dictionary<StudyType>, 'studyType')); 
    }

    @httpPost('')
    public async addExperiment(req: CutsomRequest<{name: string, type: StudyType}>, res: Response): Promise<ExperimentViewModel[]> {
        return this.experimentService.addExperiment(req.body.name, req.body.type)
    }

    @httpPost('/studies')
    public async addStudiesToExperiment(req: CutsomRequest<{experimentId: number, studies: number[]}>, res: Response): Promise<PagedResponse<StudyViewModel>> {
        return this.experimentService.addStudiesToExperiment(req.body.experimentId, req.body.studies)
    }

    @httpPost('/all-studies')
    public async addAllToExperiment(req: CutsomRequest<{id: number, searchString: string, studyType: StudyType}>, res: Response): Promise<any> {
        return this.experimentService.addAllToExperiment(_.get(req.body, 'id'),
                                                         _.get(req.body, 'searchString', ''),
                                                         _.get(req.body, 'studyType'))
    }

    @httpPost('/start')
    public async startExperiment(req: CutsomRequest<{experimentId: number, modelId: number}>, res: Response): Promise<ExperimentViewModel> {
        return this.experimentService.startExperiment(req.body.experimentId, req.body.modelId);
    }

    @httpPost('/stop')
    public async stopExperiment(req: CutsomRequest<{experimentId: number}>, res: Response): Promise<ExperimentViewModel> {
        return this.experimentService.stopExperiment(req.body.experimentId);
    }

    @httpDelete('/:id')
    public async deleteExperiment(req: CutsomRequest<any>, res: Response): Promise<ExperimentViewModel> {
        return this.experimentService.deleteExperiment(+req.params.id);
    }

    @httpGet('/results')
    public async getResults(@request() req: CutsomRequest<any>, @response() res: Response) {
        let csv = await this.experimentService.downloadResults(+_.get(req.query as _.Dictionary<string>, 'id'))
        res.header('Content-Type', 'text/csv');
        res.attachment('results.csv');
        res.send(csv);
    }
}