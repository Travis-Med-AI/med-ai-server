import { StudyType } from "../enums/StudyType";
import { Modality } from "../enums/Modality";
import { ModelInputs } from "../enums/ModelInputs";
import { ModelOutputs } from "../enums/ModelOutputs";

export interface ModelManifestItem {
    tag: string;
    displayName:string
    input: StudyType;
    modality: Modality;
    inputType: ModelInputs;
    output: ModelOutputs;
    hasImageOutput: boolean;
}