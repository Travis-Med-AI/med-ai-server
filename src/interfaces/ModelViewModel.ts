import { ModelInputs } from "../enums/ModelInputs";
import { ModelOutputs } from "../enums/ModelOutputs";

export interface ModelViewModel {
    image: string;
    input: ModelInputs;
    output: ModelOutputs;
}
