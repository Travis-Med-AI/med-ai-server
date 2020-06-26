import { controller, httpGet, httpPost } from "inversify-express-utils";
import { inject } from "inversify";
import { TYPES } from "../constants/types";
import { CutsomRequest } from "../interfaces/Request";
import * as _ from 'lodash';
import { JobService } from "../services/job.service";
import { EvalJob } from "../entity/EvalJob.entity";
import { Response } from "express";



@controller('/jobs')
export class JobController {
    constructor(@inject(TYPES.JobService) private jobService: JobService) {}

    @httpGet('')
    public async getEvalJobs(req: CutsomRequest<any>, res: Response): Promise<EvalJob[]> {
        return this.jobService.getEvalJobs();
    }

    @httpPost('/start')
    public async startJob(req: CutsomRequest<{id:number}>, res: Response): Promise<{updated: number}> {
        return this.jobService.startJob(req.body.id);
    }

    @httpPost('/kill')
    public async killJob(req: CutsomRequest<{id: number}>, res: Response): Promise<EvalJob> {
        return this.jobService.killJob(req.body.id);
    }
}
