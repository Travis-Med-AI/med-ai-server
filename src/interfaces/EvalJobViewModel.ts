import { ModelViewModel } from "./ModelViewModel";
import { EvalJobStatus } from "../enums/EvalJobStatus";

export interface EvalJobViewModel {
    model: ModelViewModel
    status: EvalJobStatus
    endTime: number;
    lastRun: number;
}