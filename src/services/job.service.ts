import { injectable, inject } from "inversify";
import { TYPES } from "../constants/types";
import { DatabaseService } from "./database.service";
import { StudyEvaluation } from "../entity/StudyEvaluation.entity";
import { EvalJob } from "../entity/EvalJob.entity";
import { Model } from "../entity/Model.entity";
import { EvalJobViewModel } from "med-ai-common";
import { UpdateResult, DeleteResult } from "typeorm";
import { EvalFactory } from "../factories/eval.factory";
import _ from 'lodash';


@injectable()
export class JobService {
    evalRepository = this.db.getRepository<StudyEvaluation>(StudyEvaluation);
    jobRepository = this.db.getRepository<EvalJob>(EvalJob);

    constructor(
        @inject(TYPES.DatabaseService) private db: DatabaseService,
        @inject(TYPES.EvalFactory) private evalFactory: EvalFactory,
    ) {}

    async getEvalJobs(): Promise<EvalJobViewModel[]> {
        let evalJobs = await this.jobRepository.find({
            relations: ['model'],     
            order: {
                id: "ASC",
        }});

        return _.map(evalJobs, job => this.evalFactory.buildEvalJobVM(job.id, job.model as Model, job.running))
    }

    async killJob(jobId): Promise<EvalJobViewModel> {
        let job = await this.jobRepository.findOneOrFail({id: jobId});
        job.running = false;
        job = await this.jobRepository.save(job);
        return this.evalFactory.buildEvalJobVM(jobId, job.model as Model, false);
    }

    async startJob(jobId: number): Promise<{updated: number}> {
        let jobDB: UpdateResult = await this.jobRepository.update({id: jobId}, {running: true})
        return { updated: jobDB.affected }
    }

    async saveEvalJob(model: Model): Promise<EvalJob> {
        let evalJob = this.evalFactory.buildEvalJob(model, false)
        return this.jobRepository.save(evalJob)
    }

    async deleteEvalJobByModelId(modelId: number): Promise<DeleteResult> {
        return this.jobRepository.delete({model: modelId})
    }
}