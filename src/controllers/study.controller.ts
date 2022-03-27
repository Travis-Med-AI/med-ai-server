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

    @httpGet('', TYPES.AuthMiddleware)
    public async getPatients(req: CutsomRequest<any>, res: Response): Promise<PagedResponse<StudyViewModel>> {
        return this.studyService.getStudies(_.get(req.query as _.Dictionary<string>, 'page'), 
                                            _.get(req.query as _.Dictionary<string>, 'pageSize'), 
                                            _.get(req.query as _.Dictionary<string>, 'searchString', ''),
                                            _.get(req.query as _.Dictionary<StudyType>, 'studyType'),
                                            req.user); 
    }

    @httpGet('/orthanc-count', TYPES.AuthMiddleware)
    public async getOrhtancStudyCount(req: CutsomRequest<any>, res: Response): Promise<{count: number}> {
        return this.studyService.getOrthancStudyCount();
    }

    @httpGet('/modalities', TYPES.AuthMiddleware)
    public async getModalities(req: CutsomRequest<any>, res: Response): Promise<{modalities: string[]}> {
        let modalities = await this.studyService.getModalities()
        return {modalities};
    }

    @httpDelete('/:id', TYPES.AuthMiddleware)
    public async deleteModel(req: CutsomRequest<any>, res: Response): Promise<any> {
        return this.studyService.deleteStudy(+req.params.id, req.user);
    }

    @httpPost('/check-series-ids', multer().single('csv'), TYPES.AuthMiddleware)
    public async checkForSeriesUID(req: CutsomRequest<any>, res: Response): Promise<csvVerification> {
        let file = req.file.buffer.toString('utf8')
        return this.studyService.checkForSeriesUID(file, parseInt(req.body.modelId), req.user)
    }

    @httpPost('/save-labels', multer().single('csv'), TYPES.AuthMiddleware)
    public async saveLabels(req: CutsomRequest<any>, res: Response): Promise<{saveCount: number}> {
        let file = req.file.buffer.toString('utf8')
        return this.studyService.saveLabels(file, parseInt(req.body.modelId), req.user)
    }
}