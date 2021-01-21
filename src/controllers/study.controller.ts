import { controller, httpGet } from "inversify-express-utils";
import { inject } from "inversify";
import { TYPES } from "../constants/types";
import { CutsomRequest } from "../interfaces/Request";
import * as _ from 'lodash';
import { StudyService } from "../services/study.service";
import { Response } from "express";
import { PagedResponse, StudyType, StudyViewModel } from "med-ai-common";
import fs from 'fs';



@controller('/studies')
export class StudyController {
    constructor(@inject(TYPES.StudyService) private studyService: StudyService) {}

    @httpGet('')
    public async getPatients(req: CutsomRequest<any>, res: Response): Promise<PagedResponse<StudyViewModel>> {
        return this.studyService.getStudies(_.get(req.query as _.Dictionary<string>, 'page'), 
                                            _.get(req.query as _.Dictionary<string>, 'pageSize'), 
                                            _.get(req.query as _.Dictionary<string>, 'searchString', ''),
                                            _.get(req.query as _.Dictionary<StudyType>, 'studyType')); 
    }

    @httpGet('/orthanc-count')
    public async getOrhtancStudyCount(req: CutsomRequest<any>, res: Response): Promise<{count: number}> {
        return this.studyService.getOrthancStudyCount();
    }
}