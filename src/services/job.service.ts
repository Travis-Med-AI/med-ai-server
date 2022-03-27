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
import { ModelService } from "./model.service";
import { User } from "../entity/User.entity";


@injectable()
export class JobService {
    evalRepository = this.db.getRepository<StudyEvaluation>(StudyEvaluation);
    jobRepository = this.db.getRepository<EvalJob>(EvalJob);
    modelRepository = this.db.getRepository<Model>(Model);

    constructor(
        @inject(TYPES.DatabaseService) private db: DatabaseService,
        @inject(TYPES.EvalFactory) private evalFactory: EvalFactory,
    ) {}

    async getEvalJobs(user: User): Promise<EvalJobViewModel[]> {
        let evalJobs = await this.jobRepository.find({
            where: {user},
            relations: ['model'],     
            order: {
                id: "ASC",
        }});

        return _.map(evalJobs, job => this.evalFactory.buildEvalJobVM(job, job.model as Model, job.running))
    }

    async killJob(jobId, user: User): Promise<EvalJobViewModel> {
        let job = await this.jobRepository.findOneOrFail({id: jobId, user: user.id});
        job.running = false;
        job = await this.jobRepository.save(job);
        return this.evalFactory.buildEvalJobVM(job, job.model, false);
    }

    async startJob(jobId: number, user: User): Promise<{updated: number}> {
        let jobDB: UpdateResult = await this.jobRepository.update({id: jobId, user: user.id}, {running: true})
        return { updated: jobDB.affected }
    }

    async toggleCPU(jobId: number, user: User): Promise<{updated: number}> {
        let jobDB: EvalJob = await this.jobRepository.findOne({id:jobId, user: user.id})
        let result: UpdateResult = await this.jobRepository.update({id: jobId, user: user.id}, {cpu: !jobDB.cpu})
        return { updated: result.affected }
    }

    async saveEvalJob(model: Model, user: User): Promise<EvalJob> {
        let evalJob = this.evalFactory.buildEvalJob(model, false, user.id)
        return this.jobRepository.save(evalJob)
    }

    async deleteEvalJobByModelId(modelId: number, user: User): Promise<DeleteResult> {
        return this.jobRepository.delete({model: modelId as any, user: user.id})
    }


    async changeReplicas(evalId: number, replicas: number, user:User): Promise<EvalJobViewModel> {
        let job = await this.jobRepository.findOne({id: evalId, user: user.id});
        job.replicas = replicas
        job = await this.jobRepository.save(job)
        return this.evalFactory.buildEvalJobVM(job, job.model, true)
    }
}