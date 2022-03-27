import { injectable } from 'inversify';
import { User } from '../entity/User.entity';
import { UserViewModel, ROLES, NewUserRequest, ModelManifestItem, ModelViewModel } from 'med-ai-common';
import { Role } from '../entity/Role.entity';
import { Model } from '../entity/Model.entity';
import { Classifier } from '../entity/Classifier.entity';


@injectable()
export class ModelFactory {

    buildModel(modelVM: ModelManifestItem, user: number): Model {
        let { tag, input, output, inputType, displayName, outputKeys } = modelVM;

        let model = new Model();
        model.image = tag;
        model.displayName = displayName;
        model.input = input; 
        model.inputType = inputType; 
        model.output = output; 
        model.hasImageOutput = modelVM.hasImageOutput
        model.modality = modelVM.modality
        model.outputKeys = outputKeys
        model.user = user

        return model;
    }

    buildModelViewModel(model: Model): ModelViewModel {
        return {
            id: model.id,
            image: model.image,
            displayName: model.displayName,
            input: model.input,
            output: model.output,
            hasImageOutput: model.hasImageOutput,
            inputType: model.inputType,
            modality: model.modality,
            pulled: model.pulled,
            outputKeys: model.outputKeys,
            failedPull: model.failedPull
        }
    }


    buildClassifier(model: Model, user: number) {
        let classifer = new Classifier();
        classifer.model = model;
        classifer.modality = model.modality
        classifer.user = user

        return classifer;
    }
}