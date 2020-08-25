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


@injectable()
export class EvalService {
    evalRepository = this.db.getRepository<StudyEvaluation>(StudyEvaluation);

    constructor(
        @inject(TYPES.DatabaseService) private db: DatabaseService,
        @inject(TYPES.StudyService) private studyService: StudyService,
        @inject(TYPES.ModelService) private modelService: ModelService,
        @inject(TYPES.EvalFactory) private evalFactory: EvalFactory,
        @inject(TYPES.ResponseFactory) private responseFactory: ResponseFactory,
    ) {}

    async evaluateStudy(modelId: number, studyId: number): Promise<StudyEvaluation> {
        let study = this.evalFactory.buildStudyEval(modelId, studyId, EvaluationStatus.running);
        
        return this.evalRepository.save(study)
    }

    async getEvals(page: number, pageSize: number, searchString: string): Promise<PagedResponse<StudyEvalVM>> {
        let query = this.evalRepository.createQueryBuilder('eval')
        .innerJoinAndSelect('eval.study', 'study')
        .innerJoinAndSelect('eval.model', 'model')
        .where('study.patientId like :patientId', {patientId: `%${searchString}%`})
        .orWhere('study.orthancStudyId like :orthancId', {orthancId: `%${searchString}%`})
        .orWhere('eval."modelOutput"::TEXT like :output', {output: `%${searchString}%`})
        .orderBy('study.patientId', 'ASC')
        .skip(page)
        .take(pageSize)

        let evals = await query.getManyAndCount()

        let studyEvalVMs = _.map(evals[0], e => this.evalFactory.buildStudyEvalViewModel(e))

        return this.responseFactory.buildPagedResponse<StudyEvalVM>(evals[0], evals[1])
    }

    async getOutputImage(evalId: number) {
        let evaluation = await this.evalRepository.findOne({id:evalId})
        console.log('image path is ', evaluation.imgOutputPath)

        return evaluation.imgOutputPath;
    }

    async deleteEval(evalId: number) {
        return this.evalRepository.delete({id:evalId})
    }

    async processDicom(modelId: number, studyId: number): Promise<any>{
        let study = await this.studyService.getStudy(studyId);
        let model = await this.modelService.getModel(modelId);

        let evaluation = await this.evaluateStudy(model.id, studyId)

        this.db.startCeleryTask('runner.evaluate_dicom', [model.id, study.orthancStudyId, evaluation.id])

        
        return {message: 'started task'}
    }

}