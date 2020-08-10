import { controller, httpGet } from "inversify-express-utils";
import { inject } from "inversify";
import { TYPES } from "../constants/types";
import { CutsomRequest } from "../interfaces/Request";
import * as _ from 'lodash';
import { StudyService } from "../services/study.service";
import { Response } from "express";
import { PagedResponse, StudyViewModel } from "med-ai-common";



@controller('/studies')
export class StudyController {
    constructor(@inject(TYPES.StudyService) private studyService: StudyService) {}

    @httpGet('')
    public async getPatients(req: CutsomRequest<any>, res: Response): Promise<PagedResponse<StudyViewModel>> {
        return this.studyService.getStudies(req.query.page, req.query.pageSize, _.get(req.query, 'searchString', ''));
    }

    @httpGet('/orthanc-count')
    public async getOrhtancStudyCount(req: CutsomRequest<any>, res: Response): Promise<{count: number}> {
        return this.studyService.getOrthancStudyCount();
    }
}