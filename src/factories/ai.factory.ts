import { injectable } from 'inversify';
import { ModelViewModel } from '../interfaces/ModelViewModel';
import { Model } from '../entity/Image.entity';
import { StudyEvaluation } from '../entity/Study.entity';
import { EvaluationStatus } from '../enums/EvaluationStatus';
import { EvalJobViewModel } from '../interfaces/EvalJobViewModel';
import { EvalJob } from '../entity/EvalJob.entity';
import { EvalJobStatus } from '../enums/EvalJobStatus';

@injectable()
export class AiFactory {

    buildModel(modelVM: ModelViewModel): Model {
        let { image, input, output } = modelVM;

        let model = new Model();
        model.image = image;
        model.input = input; 
        model.output = output; 

        return model;
    }

    buildModelViewModel(model: Model): ModelViewModel {
        return {
            id: model.id,
            image: model.image,
            input: model.input,
            output: model.output
        }
    }

    buildStudy(modelId: number, patientId: string, status: EvaluationStatus, modelOutput?: JSON): StudyEvaluation {
        let study = new StudyEvaluation();
        study.model = modelId;
        study.patient = patientId;
        if(modelOutput) study.modelOutput;
        study.status = status;
        
        return study
    }

    buildEvalJob(jobVM: EvalJobViewModel): EvalJob {
        let job = new EvalJob();
        job.endTime = jobVM.endTime;
        job.model = jobVM.model.id;
        job.status = EvalJobStatus.running;

        return job;
    }

    buildEvalJobVM(job:EvalJob, model: Model): EvalJobViewModel {
        return {
            ...job,
            model: this.buildModelViewModel(model)
        }
    }

}