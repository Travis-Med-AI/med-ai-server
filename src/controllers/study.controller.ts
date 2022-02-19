import { controller, httpGet, httpDelete, httpPost } from "inversify-express-utils";
import { inject } from "inversify";
import { TYPES } from "../constants/types";
import { CutsomRequest } from "../interfaces/Request";
import * as _ from 'lodash';
import { StudyService } from "../services/study.service";
import { Response } from "express";
import { csvVerification, PagedResponse, StudyType, StudyViewModel } from "med-ai-common";
import fs from 'fs';
import multer from 'multer';



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

    @httpDelete('/:id')
    public async deleteModel(req: CutsomRequest<any>, res: Response): Promise<any> {
        return this.studyService.deleteStudy(+req.params.id);
    }

    @httpPost('/check-series-ids', multer().single('csv'))
    public async checkForSeriesUID(req: CutsomRequest<any>, res: Response): Promise<csvVerification> {
        let file = req.file.buffer.toString('utf8')
        return this.studyService.checkForSeriesUID(file, parseInt(req.body.modelId))
    }

    @httpPost('/save-labels', multer().single('csv'))
    public async saveLabels(req: CutsomRequest<any>, res: Response): Promise<{saveCount: number}> {
        let file = req.file.buffer.toString('utf8')
        return this.studyService.saveLabels(file, parseInt(req.body.modelId))
    }
}