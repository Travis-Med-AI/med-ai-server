import { ModelOutputs } from "../enums/ModelOutputs";
import { StudyType } from "../enums/StudyType";

export interface ModelViewModel {
    id?:number;
    image: string;
    input: StudyType;
    output: ModelOutputs;
}
