import { controller, httpGet, httpPost } from "inversify-express-utils";
import { inject } from "inversify";
import { TYPES } from "../constants/types";
import { CutsomRequest } from "../interfaces/Request";
import * as _ from 'lodash';
import { StudyService } from "../services/study.service";
import { Study } from "../entity/Study.entity";
import { Response } from "express";



@controller('/studies')
export class StudyController {
    constructor(@inject(TYPES.StudyService) private studyService: StudyService) {}

    @httpGet('')
    public async getPatients(req: CutsomRequest<any>, res: Response): Promise<{studies: Study[], total: number}> {
        return this.studyService.getStudies(req.query.page, req.query.pageSize, _.get(req.query, 'searchString', ''));
    }

    @httpGet('/orthanc-count')
    public async getOrhtancStudyCount(req: CutsomRequest<any>, res: Response): Promise<{count: number}> {
        return this.studyService.getOrthancStudyCount();
    }
}