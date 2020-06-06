import { injectable } from 'inversify';
import { User } from '../entity/User.entity';
import { UserViewModel } from '../interfaces/UserViewModel';
import { Role } from '../entity/Role.entity';
import { ROLES } from '../enums/roles';
import { userInfo } from 'os';
import { NewUserRequest } from '../interfaces/NewUserRequest';
import { ModelViewModel } from '../interfaces/ModelViewModel';
import { Model } from '../entity/Image.entity';

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
            image: model.image,
            input: model.input,
            output: model.output
        }
    }

}