import { injectable } from 'inversify';
import { EvaluationStatus, ExperimentStats, ExperimentStatsViewModel, ExperimentViewModel } from 'med-ai-common';
import { Experiment } from '../entity/Experiment.entity';
import { filter } from 'lodash';
import { StudyEvaluation } from '../entity/StudyEvaluation.entity';
import { StudyLabel } from '../entity/StudyLabel.entity';
import _ from 'lodash';
import { Model } from '../entity/Model.entity';


@injectable()
export class ExperimentFactory {
    buildExperimentViewModel(experiment: Experiment, evals: StudyEvaluation[] = []): ExperimentViewModel {
        let progress = filter(evals, e => e.status === EvaluationStatus.completed).length / (experiment.studies.length || 1);
        return {
            ...experiment,
            createdDate: new Date(experiment.createdDate),
            progress
        }
    }

    getTpNpFpNp(evals: StudyEvaluation[], 
        labels: StudyLabel[], 
        outputKey: string): {tp: number, tn: number, fp: number, fn: number} {
        let truePositives = 0
        let trueNegatives = 0
        let falsePositives = 0
        let falseNegatives = 0
        let total = 0;
        let commonIds = _.intersection(
            labels.map(l => l.study.id),
            evals.map(e => e.study.id)
        )

        console.log('found ', commonIds.length, 'records')

        for (const id of commonIds){
            let studyEval = evals.find(e => e.study.id === id)
            let label = labels.find(l => l.study.id === id)
            let threshold = 0.5
            let labelValue = parseInt(label.label[outputKey])
            let evalValue = studyEval.modelOutput.class_probabilities[outputKey] > threshold
            if(labelValue && evalValue) {
                truePositives++
            } else if(!labelValue && !evalValue) {
                trueNegatives++
            } else if(!labelValue && evalValue) {
                falsePositives++
            } else if(labelValue && !evalValue) {
                falseNegatives++
            }
            total++
        }
        return {
            tp: truePositives,
            tn: trueNegatives,
            fp: falsePositives,
            fn: falseNegatives,
        }
    }

    buildEvalStats(evals: StudyEvaluation[], 
                  labels: StudyLabel[], 
                  model: Model,
                  experiment: Experiment): ExperimentStatsViewModel {
        let keys: {[key: string]: ExperimentStats} = {}           
        model.outputKeys.forEach((k: string) => {
            let stats = this.getTpNpFpNp(evals, labels, k);
            let total = stats.fn + stats.fp + stats.tn + stats.tp
            let accuracy = (stats.tp + stats.tn) / total
            let sensitivity = stats.tp / (stats.tp + stats.fn)
            let specificity = stats.tn / (stats.tn + stats.fp)
            let ppv = stats.tp / (stats.tp + stats.fp)
            let npv = stats.fn / (stats.fn + stats.tn)
            keys[k] = {
                total,
                accuracy,
                sensitivity,
                specificity,
                ppv,
                npv,
                tp: stats.tp,
                fp: stats.fp,
                tn: stats.tn,
                fn: stats.fn
            }
        })
        return {
            experimentId: experiment.id,
            keys
        }
    }
}