import { injectable } from 'inversify';
import { EvaluationStatus, ExperimentViewModel } from 'med-ai-common';
import { Experiment } from '../entity/Experiment.entity';
import { filter } from 'lodash';
import { StudyEvaluation } from '../entity/StudyEvaluation.entity';


@injectable()
export class ExperimentFactory {
    buildExperimentViewModel(experiment: Experiment, evals: StudyEvaluation[] = []): ExperimentViewModel {
        let progress = filter(evals, e => e.status === EvaluationStatus.completed).length / (evals.length || 1);
        return {
            ...experiment,
            createdDate: new Date(experiment.createdDate),
            progress
        }
    }
}