import { EvaluationStatus } from "../enums/EvaluationStatus";
import { ModelViewModel } from "./ModelViewModel";

export interface StudyEvalVM {
    id: number;
    patient: string;
    modelOutput: any;
    model: ModelViewModel
    status: EvaluationStatus
}