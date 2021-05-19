import { injectable, inject } from "inversify";
import { TYPES } from "../constants/types";
import { DatabaseService } from "./database.service";
import { ExperimentStatus, ExperimentViewModel, PagedResponse, StudyType, StudyViewModel } from "med-ai-common";
import _, { create } from 'lodash';
import { Experiment } from "../entity/Experiment.entity";
import { StudyService } from "./study.service";
import { Study } from "../entity/Study.entity";
import { ResponseFactory } from "../factories/response.factory";
import { StudyFactory } from "../factories/study.factory";
import { ModelService } from "./model.service";
import { ExperimentFactory } from "../factories/experiment.factory";
import { EvalService } from "./eval.service";
import { In } from "typeorm";
import { Parser } from 'json2csv';


@injectable()
export class ExperimentService {
    experimentRepository = this.db.getRepository<Experiment>(Experiment);
    studyRepository = this.db.getRepository<Study>(Study);

    constructor(
        @inject(TYPES.DatabaseService) private db: DatabaseService,
        @inject(TYPES.ResponseFactory) private responseFactory: ResponseFactory,
        @inject(TYPES.StudyFactory) private studyFactory: StudyFactory,
        @inject(TYPES.ExperimentFactory) private experimentFactory: ExperimentFactory,
        @inject(TYPES.StudyService) private studyService: StudyService,
        @inject(TYPES.ModelService) private modelService: ModelService,
        @inject(TYPES.EvalService) private evalService: EvalService,

    ) {}

    async getExperiments(): Promise<ExperimentViewModel[]> {
        let experiments = await this.experimentRepository.find({ 
            order: {
                lastUpdate: "ASC",
        }});

        let promises = experiments.map(async e => {
            let studyIds = e.studies.map(s => s.id);
            let evaluations = [];
            if (studyIds.length > 0) {
                evaluations = await this.evalService.evalRepository.find({
                    id: In(studyIds)
                })
            }
            return this.experimentFactory.buildExperimentViewModel(e, evaluations);
        });

        return Promise.all(promises)
    }

    async getExperimentStudies(experimentId: number, page: number=0, pageSize: number=15, studyType?: StudyType): Promise<PagedResponse<any>> {
        let query = this.studyRepository.createQueryBuilder('study')
        .innerJoin('experiment_studies_study', 'es', 'es.studyId = study.id')
        .where('es.experimentId = :experimentId', {experimentId})

        if(studyType) query = query.andWhere(`study.type = '${studyType}'`)

        query = query
        .skip(page)
        .take(pageSize)

        let studies = await query.getManyAndCount()

        let models = _.map(studies[0], ((s: Study) => this.studyFactory.buildStudyViewModel(s)))
        return this.responseFactory.buildPagedResponse(models, studies[1])
    }

    async getUnusedStudies(experimentId: number, page: number=0, pageSize: number=15, searchString: string='', studyType: StudyType): Promise<PagedResponse<any>> { 
        let query = this.studyRepository.createQueryBuilder('study')
        .leftJoin('experiment_studies_study', 'es', 'es.studyId = study.id')
        .where('es."experimentId" is null')
        if(studyType) query = query.andWhere(`study.type = '${studyType}'`)
        
        if(searchString) {
            query = query
                .andWhere(`"patientId" ILIKE '%${searchString}%'
                            OR "orthancStudyId" ILIKE '%${searchString}%'
                            OR "type" ILIKE '%${searchString}%'
                            OR "modality" ILIKE '%${searchString}%'`)    
                .skip(page)
                .take(pageSize)
        } else {
            query = query
            .orWhere('es."experimentId"<> :experimentId', {experimentId})
            .skip(page)
            .take(pageSize)
        }


        let studies = await query.getManyAndCount()
        let models = _.map(studies[0], ((s: Study) => this.studyFactory.buildStudyViewModel(s)))
        return this.responseFactory.buildPagedResponse(models, studies[1])
    }

    async addExperiment(name: string, type: StudyType): Promise<ExperimentViewModel[]> {
        let experiment = await this.experimentRepository.insert({name, type})
        return this.getExperiments();
    }

    async addStudiesToExperiment(id: number, studyIds: number[]): Promise<PagedResponse<StudyViewModel>> {
        let experiment = await this.experimentRepository.findOne({id})
        let ids = _.concat(studyIds, experiment.studies.map(s => s.id))
        ids = _.uniq(ids);
        experiment.studies = await this.studyService.getStudiesByIds(ids);
        experiment = await this.experimentRepository.save(experiment);
        return this.getExperimentStudies(id);
    }

    async startExperiment(experimentId: number, modelId: number): Promise<ExperimentViewModel> {
        let model = await this.modelService.getModel(modelId);
        await this.experimentRepository.update({id: experimentId}, {model, status: ExperimentStatus.RUNNING})

        let experiment = await this.experimentRepository.findOne({id: experimentId});
        return this.experimentFactory.buildExperimentViewModel(experiment);
    }

    async stopExperiment(experimentId: number): Promise<ExperimentViewModel> {
        await this.experimentRepository.update({id: experimentId}, {status: ExperimentStatus.NEW})

        let experiment = await this.experimentRepository.findOne({id: experimentId});
        return this.experimentFactory.buildExperimentViewModel(experiment);
    }

    async deleteExperiment(experimentId: number): Promise<any> {
        return this.experimentRepository.delete({id: experimentId})
    }

    async downloadResults(experimentId: number): Promise<any> {
        let experiment = await this.experimentRepository.findOne({id: experimentId})

        // TODO: FIX THIS!!!
        let evals = await this.evalService.evalRepository.find()

        let probs = _.get(evals[0], 'modelOutput.class_probabilities')


        let extraFields = []

        evals.forEach(e => {
            let prob = _.get(e, 'modelOutput.class_probabilities', {})
            let kvArray = Object.keys(prob).map(k => ({value: k, label: k}))
            extraFields = _.concat(probs, kvArray)
        });

        extraFields = _.uniqBy(evals, 'value')

        let fields = [
            {value:'studyUid', label: 'Study UID'},
            {value:'seriesUid', label: 'Series UID'},
            {value:'patientId', label: 'Patient Id'},
            {value:'orthancId', label: 'Orthanc Study Id'},
            {value:'diagnosis', label: 'Diagnosis'},
            ...extraFields
        ]

        const json2csv = new Parser({fields})

        return json2csv.parse(
            evals.map(e => ({
                studyUid: _.get(e, 'study.studyUid'),
                seriesUid: _.get(e, 'study.seriesUid'),
                patientId: _.get(e, 'study.patientId'),
                orthancId: _.get(e, 'study.orthancStudyId'),
                diagnosis: _.get(e, 'modelOutput.display', '').replace(/,/g, '\,'),
                ...e.modelOutput.class_probabilities
            }))
        )
    }

    async downloadKaggleCSV(experimentId: number) {
        let experiment = await this.experimentRepository.findOne({id: experimentId})

        let evals = await this.evalService.evalRepository.find()

        let probs = []

        evals.forEach(e => {
            let prob = _.get(e, 'modelOutput.class_probabilities', {})
            let kvArray = Object.keys(prob).map(k => ({id: k, label: prob[k]}))
            probs = _.concat(probs, kvArray)
        });

        let fields = [
            {value:'id', label: 'id'},
            {value:'label', label: 'label'},
        ]

        const json2csv = new Parser({fields})
        return json2csv.parse(probs)
    }

    async addAllToExperiment(experimentId: number, searchString: string='', studyType: StudyType) {
        let query = this.studyRepository.createQueryBuilder('study')
        .leftJoin('experiment_studies_study', 'es', 'es.studyId = study.id')
        .where('es."experimentId" is null')

        if(studyType) query = query.andWhere(`study.type = '${studyType}'`)
        
        if(searchString) {
            query = query
                .andWhere(`"patientId" ILIKE '%${searchString}%'
                            OR "orthancStudyId" ILIKE '%${searchString}%'
                            OR "type" ILIKE '%${searchString}%'
                            OR "modality" ILIKE '%${searchString}%'`)    
        } 

        let studies = await query.getMany()
        await this.addStudiesToExperiment(experimentId, studies.map(s=>s.id))

        return {}
    }
}