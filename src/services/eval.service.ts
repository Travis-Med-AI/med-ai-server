import { injectable, inject } from "inversify";
import { TYPES } from "../constants/types";
import { DatabaseService } from "./database.service";
import { StudyEvaluation } from "../entity/StudyEvaluation.entity";
import { EvaluationStatus, StudyEvalVM } from "med-ai-common";
import { StudyService } from "./study.service";
import { ModelService } from "./model.service";
import { PagedResponse } from 'med-ai-common';
import { EvalFactory } from "../factories/eval.factory";
import { ResponseFactory } from "../factories/response.factory";
import _ from 'lodash';
import { Study } from "../entity/Study.entity";
import { AppSettingsService } from "./appSettings.service";
import { ModelFactory } from "../factories/model.factory";
import { Model } from "../entity/Model.entity";
import { Result } from "../interfaces/Results";
import { User } from "../entity/User.entity";


@injectable()
export class EvalService {
    evalRepository = this.db.getRepository<StudyEvaluation>(StudyEvaluation);

    constructor(
        @inject(TYPES.DatabaseService) private db: DatabaseService,
        @inject(TYPES.StudyService) private studyService: StudyService,
        @inject(TYPES.ModelService) private modelService: ModelService,
        @inject(TYPES.EvalFactory) private evalFactory: EvalFactory,
        @inject(TYPES.ResponseFactory) private responseFactory: ResponseFactory,
        @inject(TYPES.AppSettingsService) private settings: AppSettingsService,
        @inject(TYPES.ModelFactory) private modelFactory: ModelFactory,
    ) {}

    async evaluateStudy(modelId: number, studyId: number, user: User): Promise<StudyEvaluation> {
        let study = await this.studyService.getStudy(studyId)
        let studyEval = this.evalFactory.buildStudyEval(modelId, study, EvaluationStatus.running, user.id);
        
        return this.evalRepository.save(studyEval)
    }

    async getEvalsByStudyIds(studyIds: number[], user: User): Promise<StudyEvaluation[]> {
        let query = this.evalRepository.createQueryBuilder('eval')
        .leftJoinAndSelect('eval.study', 'study')
        .where({user})
        .andWhere('study.id IN (:...studyIds)', {studyIds})
        

        return query.getMany();
    }

    async getEvals(page: number, pageSize: number, searchString: string, user: User): Promise<PagedResponse<StudyEvalVM>> {
        let query = this.evalRepository.createQueryBuilder('eval')
        .innerJoinAndSelect('eval.study', 'study')
        .innerJoinAndSelect('eval.model', 'model')
        .where({user})
        .andWhere('study.patientId like :patientId', {patientId: `%${searchString}%`})
        .orWhere('study.orthancStudyId like :orthancId', {orthancId: `%${searchString}%`})
        .orWhere('eval."modelOutput"::TEXT like :output', {output: `%${searchString}%`})
        .addOrderBy('eval.lastUpdate', 'DESC')
        .addOrderBy('eval.status', 'DESC')
        .skip(page)
        .take(pageSize)

        let evals = await query.getManyAndCount()

        let studyEvalVMs = _.map(evals[0], e => {
            let study = e.study as Study
            let model = this.modelFactory.buildModelViewModel(e.model as Model)
            return this.evalFactory.buildStudyEvalViewModel(e, study.orthancStudyId, model)
        })

        return this.responseFactory.buildPagedResponse<StudyEvalVM>(studyEvalVMs, evals[1])
    }

    async getOutputImage(evalId: number, user: User) {
        let evaluation = await this.evalRepository.findOne({id:evalId, user: user.id})
        console.log('image path is ', evaluation.imgOutputPath)

        return evaluation.imgOutputPath;
    }

    async deleteEval(evalId: number, user: User) {
        return this.evalRepository.delete({id:evalId, user: user.id})
    }

    async processDicom(modelId: number, studyId: number, user: User): Promise<any>{
        let study = await this.studyService.getStudy(studyId);
        let model = await this.modelService.getModel(modelId, user);

        this.settings.startCeleryTask('runner.evaluate_dicom', [model.id, study.orthancStudyId])

        return {message: 'started task'}
    }

    async getEvalLog(evalId:number, user: User): Promise<string[]> {
        let evaluation = await this.evalRepository.findOne({id: evalId, user: user.id});

        return evaluation.stdout;
    }

    async getResults(modelId: number, user:User): Promise<Result[]> {
        let model = await this.modelService.getModel(modelId, user)
        let evaluations = await this.evalRepository.find({model: model, user: user.id})

        return evaluations.map(e => this.evalFactory.buildResult(e, model))
    }

}