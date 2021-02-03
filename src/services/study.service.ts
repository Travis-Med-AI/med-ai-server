import { injectable, inject } from "inversify";
import { TYPES } from "../constants/types";
import { DatabaseService } from "./database.service";
import { Study } from "../entity/Study.entity";
import axios from 'axios';
import { AppSettingsService } from "./appSettings.service";
import { Logger } from "log4js";
import { PagedResponse, StudyType, StudyViewModel } from "med-ai-common";
import { StudyFactory } from "../factories/study.factory";
import _ from 'lodash';
import { ResponseFactory } from "../factories/response.factory";


@injectable()
export class StudyService {
    studyRepository = this.db.getRepository<Study>(Study);

    constructor(
        @inject(TYPES.DatabaseService) private db: DatabaseService,
        @inject(TYPES.StudyFactory) private studyFactory: StudyFactory,
        @inject(TYPES.ResponseFactory) private responseFactory: ResponseFactory,
        @inject(TYPES.Logger) private logger: Logger,
        @inject(TYPES.AppSettingsService) private settingsService: AppSettingsService
    ) {}

    async evaluateStudies(modelId: number) {
        this.db.startCeleryTask('runner.evaluate_studies', [modelId])
        return `started task for model ${modelId}`
    }

    async getStudies(page: string, pageSize: string, searchString: string, studyType: StudyType): Promise<PagedResponse<StudyViewModel>> {
        let query = this.studyRepository.createQueryBuilder('study').where('study.type is not null')

        if(studyType) query = query.andWhere(`study.type = '${studyType}'`)
        if (searchString) {
            query = query
            .orWhere('study.patientId like :patientId', {patientId: `%${searchString}%`})
            .orWhere('study.orthancStudyId like :orthancId', {orthancId: `%${searchString}%`})
            .orWhere('study."modality"::TEXT like :modality', {modality: `%${searchString}%`})
            .orWhere('study."type"::TEXT like :type', {type: `%${searchString}%`})
        }


        query = query
        .skip(+page)
        .take(+pageSize)

        let studies = await query.getManyAndCount()
        
        this.logger.info('getting studies');

        let studyViewModels = _.map(studies[0], study => this.studyFactory.buildStudyViewModel(study))

        return this.responseFactory.buildPagedResponse(studyViewModels, studies[1])
    }

    async getOrthancStudyCount() {
        let studies = await axios.get(`${this.settingsService.getOrthancUrl()}/studies`)

        return {count: studies.data.length}
    }

    async getStudy(id: number): Promise<Study> {
        return this.studyRepository.findOne({id})
    }

    async getPreview(orthancId: string): Promise<string>{
        let study = await this.studyRepository.findOne({orthancStudyId:orthancId})
        return `/tmp/${study.orthancStudyId}.png`
    }

    async getStudiesByIds(studIds: number[]): Promise<Study[]> {
        return await this.studyRepository.findByIds(studIds)
    }
}