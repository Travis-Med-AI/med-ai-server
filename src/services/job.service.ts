import { injectable, inject } from "inversify";
import { TYPES } from "../constants/types";
import { DatabaseService } from "./database.service";
import { StudyEvaluation } from "../entity/StudyEvaluation.entity";
import { EvalJob } from "../entity/EvalJob.entity";
import { Model } from "../entity/Model.entity";
import { AiFactory } from "../factories/ai.factory";


@injectable()
export class JobService {
    evalRepository = this.db.getRepository<StudyEvaluation>(StudyEvaluation);
    jobRepository = this.db.getRepository<EvalJob>(EvalJob);

    constructor(
        @inject(TYPES.DatabaseService) private db: DatabaseService,
        @inject(TYPES.AiFatory) private aiFactory: AiFactory
    ) {}

    async getEvalJobs(): Promise<EvalJob[]> {
        let evalJobs = await this.jobRepository.find({relations: ['model']});

        return evalJobs
    }

    async killJob(jobId): Promise<EvalJob> {
        let job = await this.jobRepository.findOneOrFail({id: jobId});
        job.running = false;
        return await this.jobRepository.save(job);
    }

    async startJob(jobId: number): Promise<{updated: number}> {
        let jobDB = await this.jobRepository.update({id: jobId}, {running: true})
        return { updated: jobDB.affected }
    }

    async saveEvalJob(model: Model): Promise<EvalJob> {
        let evalJob = this.aiFactory.buildEvalJob(model, false)
        return this.jobRepository.save(evalJob)
    }
}