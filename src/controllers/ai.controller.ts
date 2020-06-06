import {
    controller, httpGet, httpPost
  } from 'inversify-express-utils';
import { Response } from 'express';
import { inject } from 'inversify';
import { TYPES } from '../constants/types';
import { UserService } from '../services/user.service';
import { User } from '../entity/User.entity';
import { UserViewModel } from '../interfaces/UserViewModel';
import { CutsomRequest } from '../interfaces/Request';
import { Role } from '../entity/Role.entity';
import { NewUserRequest } from '../interfaces/NewUserRequest';
import { SignInRequest } from '../interfaces/SignInRequest';
import { AiService } from '../services/ai.service';
import { ModelViewModel } from '../interfaces/ModelViewModel';

@controller('/ai')
export class AiController {
    constructor(@inject(TYPES.AiService) private aiService: AiService) {}

    @httpGet('/:modelId/:studyId') 
    public async processDicom(req: CutsomRequest<any>, res: Response): Promise<any> {
        return this.aiService.processDicom(+req.params.modelId, req.params.studyId);
    }

    @httpPost('/registerModel')
    public async registerModel(req: CutsomRequest<ModelViewModel>, res: Response): Promise<ModelViewModel> {
        return this.aiService.registerModel(req.body)
    }

    @httpGet('/models')
    public async getModels(req: CutsomRequest<ModelViewModel>, res: Response): Promise<ModelViewModel[]> {
        return this.aiService.getModels();
    }

}
