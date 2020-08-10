import { injectable, inject } from 'inversify';
import { EvaluationStatus, StudyEvalVM, EvalJobViewModel, EvalJobStatus } from 'med-ai-common';
import { StudyEvaluation } from '../entity/StudyEvaluation.entity';
import { TYPES } from '../constants/types';
import { StudyFactory } from './study.factory';
import { Study } from '../entity/Study.entity';
import { Model } from '../entity/Model.entity';
import { ModelFactory } from './model.factory';
import { EvalJob } from '../entity/EvalJob.entity';


@injectable()
export class EvalFactory {
    constructor(@inject(TYPES.StudyFactory) private studyFactory: StudyFactory,
                @inject(TYPES.ModelFactory) private modelFactory: ModelFactory) {}

    buildStudyEval(modelId: number, studyId: number, status: EvaluationStatus, modelOutput?: JSON): StudyEvaluation {
        let study = new StudyEvaluation();
        study.model = modelId;
        study.study = studyId;
        if(modelOutput) study.modelOutput;
        study.status = status;
        
        return study
    }

    buildStudyEvalViewModel(evaluation: StudyEvaluation): StudyEvalVM {
        
        return {
            id: evaluation.id,
            modelOutput: evaluation.modelOutput,
            status: evaluation.status, 
            imgOutputPath: evaluation.imgOutputPath,
            lastUpdate: evaluation.lastUpdate
        }
    }

    buildEvalJob(model: Model, running: boolean): EvalJob {
        let job = new EvalJob();
        job.model = model;
        job.running = running

        return job;
    }

    buildEvalJobVM(jobId: number, model: Model, running: boolean): EvalJobViewModel {
        return {
            id: jobId,
            model: this.modelFactory.buildModelViewModel(model),
            running
        }
    }
}