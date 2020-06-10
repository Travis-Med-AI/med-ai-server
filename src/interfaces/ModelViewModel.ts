import { ModelInputs } from "../enums/ModelInputs";
import { ModelOutputs } from "../enums/ModelOutputs";

export interface ModelViewModel {
    id?:number;
    image: string;
    input: ModelInputs;
    output: ModelOutputs;
}
