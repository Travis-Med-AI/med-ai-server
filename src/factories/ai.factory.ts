import { injectable } from 'inversify';
import { ModelViewModel } from '../interfaces/ModelViewModel';
import { Model } from '../entity/Model.entity';
import { StudyEvaluation } from '../entity/StudyEvaluation.entity';
import { EvaluationStatus } from '../enums/EvaluationStatus';
import { EvalJob } from '../entity/EvalJob.entity';
import { Classifier } from '../entity/Classifier.entity';

@injectable()
export class AiFactory {

    buildModel(modelVM: ModelViewModel): Model {
        let { image, input, output, inputType } = modelVM;

        let model = new Model();
        model.image = image;
        model.input = input; 
        model.inputType = inputType; 
        model.output = output; 
        model.hasImageOutput = modelVM.hasImageOutput
        model.modality = modelVM.modality

        return model;
    }

    buildModelViewModel(model: Model): ModelViewModel {
        return {
            id: model.id,
            image: model.image,
            input: model.input,
            output: model.output,
            hasImageOutput: model.hasImageOutput,
            inputType: model.inputType,
            modality: model.modality
        }
    }

    buildStudyEval(modelId: number, studyId: number, status: EvaluationStatus, modelOutput?: JSON): StudyEvaluation {
        let study = new StudyEvaluation();
        study.model = modelId;
        study.study = studyId;
        if(modelOutput) study.modelOutput;
        study.status = status;
        
        return study
    }

    buildEvalJob(model: Model, running: boolean): EvalJob {
        let job = new EvalJob();
        job.model = model;
        job.running = running

        return job;
    }


    buildClassifier(model: Model) {
        let classifer = new Classifier();
        classifer.model = model;
        classifer.modality = model.modality

        return classifer;
    }

}