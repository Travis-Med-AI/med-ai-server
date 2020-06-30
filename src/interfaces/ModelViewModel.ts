import { ModelOutputs } from "../enums/ModelOutputs";
import { StudyType } from "../enums/StudyType";
import { ModelInputs } from "../enums/ModelInputs";
import { Modality } from "../enums/Modality";

export interface ModelViewModel {
    id?:number;
    image: string;
    input: StudyType;
    inputType: ModelInputs;
    output: ModelOutputs;
    hasImageOutput: boolean;
    modality: Modality;
}
