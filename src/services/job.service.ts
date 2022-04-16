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

    async getEvalJobs(): Promise<EvalJobViewModel[]> {
        let evalJobs = await this.jobRepository.find({
            relations: ['model'],     
            order: {
                id: "ASC",
        }});

        return _.map(evalJobs, job => this.evalFactory.buildEvalJobVM(job, job.model as Model, job.running))
    }

    async killJob(jobId): Promise<EvalJobViewModel> {
        let job = await this.jobRepository.findOneOrFail({id: jobId});
        job.running = false;
        job = await this.jobRepository.save(job);
        return this.evalFactory.buildEvalJobVM(job, job.model, false);
    }

    async startJob(jobId: number): Promise<{updated: number}> {
        let jobDB: UpdateResult = await this.jobRepository.update({id: jobId}, {running: true})
        return { updated: jobDB.affected }
    }

    async toggleCPU(jobId: number): Promise<{updated: number}> {
        let jobDB: EvalJob = await this.jobRepository.findOne({id:jobId})
        let result: UpdateResult = await this.jobRepository.update({id: jobId}, {cpu: !jobDB.cpu})
        return { updated: result.affected }
    }

    async saveEvalJob(model: Model): Promise<EvalJob> {
        let evalJob = this.evalFactory.buildEvalJob(model, false)
        return this.jobRepository.save(evalJob)
    }

    async deleteEvalJobByModelId(modelId: number): Promise<DeleteResult> {
        return this.jobRepository.delete({model: modelId as any})
    }


    async changeReplicas(evalId: number, replicas: number): Promise<EvalJobViewModel> {
        let job = await this.jobRepository.findOne({id: evalId});
        job.replicas = replicas
        job = await this.jobRepository.save(job)
        return this.evalFactory.buildEvalJobVM(job, job.model, true)
    }

    async deleteOrthancOnComplete(jobId: number) {
        let jobDB: EvalJob = await this.jobRepository.findOne({id:jobId})
        let result: UpdateResult = await this.jobRepository.update({id: jobId}, {deleteOrthanc: !jobDB.deleteOrthanc})
        return { updated: result.affected }
    }


}