import { injectable, inject } from "inversify";
import { TYPES } from "../constants/types";
import { DatabaseService } from "./database.service";
import { StudyEvaluation } from "../entity/StudyEvaluation.entity";
import { Study } from "../entity/Study.entity";
import axios from 'axios';
import * as Celery from 'celery-ts';
import { AppSettingsService } from "./appSettings.service";
import { Like } from "typeorm";


@injectable()
export class StudyService {
    studyRepository = this.db.getRepository<Study>(Study);

    constructor(
        @inject(TYPES.DatabaseService) private db: DatabaseService,
        @inject(TYPES.AppSettingsService) private settingsService: AppSettingsService
    ) {}

    async evaluateStudies(modelId: number) {
        this.db.startCeleryTask('runner.evaluate_studies', [modelId])
        return `started task for model ${modelId}`
    }

    async getStudies(page: string, pageSize: string, searchString: string): Promise<{studies: Study[], total: number}> {
        let studies = await this.studyRepository.findAndCount({
            skip: +page,
            take: +pageSize,
            where: `"patientId" ILIKE '%${searchString}%'
                OR "orthancStudyId" ILIKE '%${searchString}%'
                OR "type" ILIKE '%${searchString}%'
                OR "modality" ILIKE '%${searchString}%'
            ` 
        }, );

        return {studies: studies[0], total: studies[1]};
    }

    async getOrthancStudyCount() {
        let studies = await axios.get(`${this.settingsService.getOrthancUrl()}/studies`)

        return {count: studies.data.length}
    }

    async getStudy(id: number): Promise<Study> {
        return this.studyRepository.findOne({id})
    }
}