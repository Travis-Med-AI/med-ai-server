import { injectable, inject } from "inversify";
import { TYPES } from "../constants/types";
import { DatabaseService } from "./database.service";
import { Study } from "../entity/Study.entity";
import axios from 'axios';
import { AppSettingsService } from "./appSettings.service";
import { Logger } from "log4js";
import { PagedResponse, StudyType, StudyViewModel, csvVerification } from "med-ai-common";
import { StudyFactory } from "../factories/study.factory";
import _ from 'lodash';
import { ResponseFactory } from "../factories/response.factory";
import * as CSV from 'csv-string';
import { ModelService } from "./model.service";
import { LabelRow } from "../interfaces/LabelCSV";
import { StudyLabel } from "../entity/StudyLabel.entity";
import { User } from "../entity/User.entity";


@injectable()
export class StudyService {
    studyRepository = this.db.getRepository<Study>(Study);
    studyLabelRepository = this.db.getRepository<StudyLabel>(StudyLabel);

    constructor(
        @inject(TYPES.DatabaseService) private db: DatabaseService,
        @inject(TYPES.StudyFactory) private studyFactory: StudyFactory,
        @inject(TYPES.ResponseFactory) private responseFactory: ResponseFactory,
        @inject(TYPES.Logger) private logger: Logger,
        @inject(TYPES.AppSettingsService) private settingsService: AppSettingsService,
        @inject(TYPES.ModelService) private modelService: ModelService
    ) {}

    async evaluateStudies(modelId: number) {
        this.settingsService.startCeleryTask('runner.evaluate_studies', [modelId])
        return `started task for model ${modelId}`
    }

    async getStudies(page: string, 
                     pageSize: string, 
                     searchString: string, 
                     studyType: StudyType,
                     user: User): Promise<PagedResponse<StudyViewModel>> {
        let query = this.studyRepository.createQueryBuilder('study').where('study.type is not null')

        if(studyType) query = query.andWhere(`study.type = '${studyType}'`)
        if (searchString) {
            query = query
            .where('study.patientId like :patientId', {patientId: `%${searchString}%`})
            .orWhere('study.orthancStudyId like :orthancId', {orthancId: `%${searchString}%`})
            .orWhere('study."modality"::TEXT like :modality', {modality: `%${searchString}%`})
            .orWhere('study."type"::TEXT like :type', {type: `%${searchString}%`})
            .andWhere('study.userId = :userId', {userId: user.id})
        }


        query = query
        .skip(+page)
        .take(+pageSize)

        let studies = await query.getManyAndCount()
        
        this.logger.info('getting studies');

        let studyViewModels = _.map(studies[0], study => this.studyFactory.buildStudyViewModel(study))

        return this.responseFactory.buildPagedResponse(studyViewModels, studies[1])
    }

    async deleteStudy(studyId:number, user: User): Promise<any> {
        return await this.studyRepository.delete({id: studyId})
    }

    async getOrthancStudyCount() {
        let studies = await axios.get(`${this.settingsService.getOrthancUrl()}/series`)

        return {count: studies.data.length}
    }

    async getStudy(id: number): Promise<Study> {
        return this.studyRepository.findOne({id})
    }

    async getPreview(orthancId: string): Promise<string>{
        let study = await this.studyRepository.findOne({orthancStudyId:orthancId})
        return `/opt/images/${study.orthancStudyId}.png`
    }

    async getStudiesByIds(studIds: number[]): Promise<Study[]> {
        return await this.studyRepository.findByIds(studIds)
    }

    async checkForSeriesUID(csv: string, modelId: number, user:User): Promise<csvVerification>{
        let parse_mapped = await this.parseLabels(csv)
        let seriesIds: string[] = parse_mapped.map(r=>r.seriesUID.trim())

        let model = await this.modelService.getModel(modelId, user);
        let studies = await this.studyRepository.createQueryBuilder("study")
        .where({user})
        .andWhere("study.seriesUid IN (:...seriesIds)", { seriesIds })
        .getMany();

        return this.studyFactory.buildCSVVerification(studies.length, parse_mapped, model.outputKeys)
    }

    async parseLabels(csv: string): Promise<LabelRow[]> {
        let parsed = CSV.parse(csv)
        let headers = parsed.shift()
        return parsed.map(r => this.studyFactory.buildLabelRow([...headers], r))
    }

    async saveLabels(csv: string, modelId: number, user: User): Promise<{saveCount: number}> {
        let parse_mapped = await this.parseLabels(csv)
        let model = await this.modelService.getModel(modelId, user);
        let saveCount = 0
        for (const row of parse_mapped){
            let series = await this.studyRepository.findOneOrFail({seriesUid: row.seriesUID})
            let studyLabel = this.studyFactory.buildStudyLabel(row, series, model, user.id)
            if (Object.keys(studyLabel.label).length) {
                await this.studyLabelRepository.save(studyLabel)
                saveCount++
            }
        }
        return {saveCount}
    }

    async getLabelsByStudyIds(studyIds: number[], user: User): Promise<StudyLabel[]> {
        let query = this.studyLabelRepository.createQueryBuilder("studyLabel")
        .innerJoinAndSelect('studyLabel.study', 'study')
        .innerJoinAndSelect('studyLabel.model', 'model')
        .where({user})
        .andWhere("studyLabel.id IN (:...studyIds)", { studyIds })

        return query.getMany()
    }

    async getModalities(): Promise<string[]> {
        let modalities = await this.studyRepository.createQueryBuilder("study")
                                                   .select('modality')
                                                   .distinct(true)
                                                   .getRawMany<{modality:string}>()

        return modalities.map(m=>m.modality)
    }
}