import { injectable, inject } from 'inversify';
import { EvaluationStatus, StudyEvalVM, EvalJobViewModel, EvalJobStatus, ModelViewModel } from 'med-ai-common';
import { StudyEvaluation } from '../entity/StudyEvaluation.entity';
import { TYPES } from '../constants/types';
import { StudyFactory } from './study.factory';
import { Study } from '../entity/Study.entity';
import { Model } from '../entity/Model.entity';
import { ModelFactory } from './model.factory';
import { EvalJob } from '../entity/EvalJob.entity';
import { Result } from '../interfaces/Results';
import * as _ from 'lodash';


@injectable()
export class EvalFactory {
    constructor(@inject(TYPES.StudyFactory) private studyFactory: StudyFactory,
                @inject(TYPES.ModelFactory) private modelFactory: ModelFactory) {}

    buildStudyEval(modelId: number, study: Study, status: EvaluationStatus, modelOutput?: JSON): StudyEvaluation {
        let studyEval = new StudyEvaluation();
        studyEval.model = modelId;
        studyEval.study = study;
        if(modelOutput) studyEval.modelOutput;
        studyEval.status = status;
        
        return studyEval
    }

    buildStudyEvalViewModel(evaluation: StudyEvaluation, orthancId: string, model: ModelViewModel): StudyEvalVM {

        return {
            id: evaluation.id,
            orthancId,
            modelOutput: evaluation.modelOutput,
            status: evaluation.status, 
            imgOutputPath: evaluation.imgOutputPath,
            lastUpdate: evaluation.lastUpdate,
            logs: evaluation.stdout,
            study: this.studyFactory.buildStudyViewModel(evaluation.study as Study),
            model: model
        }
    }

    buildEvalJob(model: Model, running: boolean): EvalJob {
        let job = new EvalJob();
        job.model = model;
        job.running = running

        return job;
    }

    buildEvalJobVM(job: EvalJob, model: Model, running: boolean): EvalJobViewModel {
        return {
            id: job.id,
            model: this.modelFactory.buildModelViewModel(model),
            running,
            cpu: job.cpu,
            replicas: job.replicas,
            deleteOrthanc: job.deleteOrthanc
        }
    }

    buildResult(evaluation: StudyEvaluation, model: Model): Result {
        return {
            modelId: model.id,
            output: _.get(evaluation.modelOutput, 'class_probabilities', {}),
            seriesUID: evaluation.study.seriesUid,
            studyUID: evaluation.study.studyUid,
            date:evaluation.finishTime,
            imageUrl: evaluation.imgOutputPath
        }
    }
}