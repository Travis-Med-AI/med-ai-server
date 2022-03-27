import { injectable, inject } from "inversify";
import { TYPES } from "../constants/types";
import { DatabaseService } from "./database.service";
import { 
    ExperimentStatus, 
    ExperimentViewModel, 
    PagedResponse, 
    StudyType, 
    StudyViewModel,
    ExperimentStatsViewModel } from "med-ai-common";
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
import { StudyEvaluation } from "../entity/StudyEvaluation.entity";
import { StudyLabel } from "../entity/StudyLabel.entity";
import { User } from "../entity/User.entity";


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

    async getExperiments(user: User): Promise<ExperimentViewModel[]> {
        let experiments = await this.experimentRepository.find({ 
            where: {user},
            order: {
                lastUpdate: "ASC",
        }});

        let promises = experiments.map(async e => {
            let studyIds = e.studies.map(s => s.id);
            let evaluations = [];
            if (studyIds.length > 0) {
                evaluations = await this.evalService.getEvalsByStudyIds(studyIds, user)
            }
            return this.experimentFactory.buildExperimentViewModel(e, evaluations);
        });

        return Promise.all(promises)
    }

    async getExperimentStudies(experimentId: number,
                               user:User,
                               page: number=0, 
                               pageSize: number=15,
                               studyType?: StudyType): Promise<PagedResponse<any>> {
        let query = this.studyRepository.createQueryBuilder('study')
        .innerJoin('experiment_studies_study', 'es', 'es.studyId = study.id')
        .andWhere('es.experimentId = :experimentId', {experimentId})

        if(studyType) query = query.andWhere(`study.type = '${studyType}'`)

        query = query
        .skip(page)
        .take(pageSize)

        let studies = await query.getManyAndCount()

        let models = _.map(studies[0], ((s: Study) => this.studyFactory.buildStudyViewModel(s)))
        return this.responseFactory.buildPagedResponse(models, studies[1])
    }

    async getUnusedStudies(experimentId: number, 
                           user: User,
                           page: number=0, 
                           pageSize: number=15, 
                           searchString: string='', 
                           studyType: StudyType, 
                           modality: string
                           ): Promise<PagedResponse<any>> { 
        let query = this.studyRepository.createQueryBuilder('study')
        .leftJoin('experiment_studies_study', 'es', 'es.studyId = study.id')
        .where({user})
        .andWhere('es."experimentId" is null')

        if(searchString) {
            query = query
                .andWhere(`"patientId" ILIKE '%${searchString}%'
                            OR "orthancStudyId" ILIKE '%${searchString}%'
                            OR "type" ILIKE '%${searchString}%'
                            OR "modality" ILIKE '%${searchString}%'`)
            if(studyType) query = query.andWhere(`study.type = '${studyType}'`)
            if(modality) query = query.andWhere(`study.modality = '${modality}'`)  
            query.skip(page).take(pageSize)
        } else {
            query = query.orWhere('es."experimentId"<> :experimentId', {experimentId})

            if(studyType) query = query.andWhere(`study.type = '${studyType}'`)
            if(modality) query = query.andWhere(`study.modality = '${modality}'`) 

            query.skip(page).take(pageSize)
        }


        let studies = await query.getManyAndCount()
        let models = _.map(studies[0], ((s: Study) => this.studyFactory.buildStudyViewModel(s)))
        return this.responseFactory.buildPagedResponse(models, studies[1])
    }

    async addExperiment(name: string, type: StudyType, user: User): Promise<ExperimentViewModel[]> {
        let experiment = await this.experimentRepository.insert({name, type, user: user.id})
        return this.getExperiments(user);
    }

    async addStudiesToExperiment(id: number, studyIds: number[], user:User): Promise<PagedResponse<StudyViewModel>> {
        let experiment = await this.experimentRepository.findOneOrFail({id, user: user.id})
        let ids = _.concat(studyIds, experiment.studies.map(s => s.id))
        ids = _.uniq(ids);
        experiment.studies = await this.studyService.getStudiesByIds(ids);
        experiment = await this.experimentRepository.save(experiment);
        console.log('made it here')
        return this.getExperimentStudies(id, user);
    }

    async startExperiment(experimentId: number, modelId: number, user: User): Promise<ExperimentViewModel> {
        let model = await this.modelService.getModel(modelId, user);
        await this.experimentRepository.update({id: experimentId, user: user.id}, {model, status: ExperimentStatus.RUNNING})

        let experiment = await this.experimentRepository.findOne({id: experimentId, user: user.id});
        return this.experimentFactory.buildExperimentViewModel(experiment);
    }

    async stopExperiment(experimentId: number, user: User): Promise<ExperimentViewModel> {
        await this.experimentRepository.update({id: experimentId, user: user.id}, {status: ExperimentStatus.NEW})

        let experiment = await this.experimentRepository.findOne({id: experimentId, user: user.id});
        return this.experimentFactory.buildExperimentViewModel(experiment);
    }

    async deleteExperiment(experimentId: number, user: User): Promise<any> {
        return this.experimentRepository.delete({id: experimentId, user: user.id})
    }

    async downloadResults(experimentId: number, user: User): Promise<any> {
        let experiment = await this.experimentRepository.findOne({id: experimentId, user: user.id})

        // TODO: FIX THIS!!!
        let evals = await this.evalService.evalRepository.find({user: user.id})

        let probs = _.get(evals[0], 'modelOutput.class_probabilities')


        let fields = [
            {value:'studyUid', label: 'Study UID'},
            {value:'seriesUid', label: 'Series UID'},
            {value:'patientId', label: 'Patient Id'},
            {value:'orthancId', label: 'Orthanc Study Id'},
            {value:'diagnosis', label: 'Diagnosis'},
            {value:'classProbs', label: 'Class Probabilities'},
        ]

        const json2csv = new Parser({fields})

        return json2csv.parse(
            evals.map(e => {
                let diagnosis = _.get(e, 'modelOutput.display', '')
                let probs = JSON.stringify(_.get(e, 'modelOutput.class_probabilities', {}))
                return {
                    studyUid: _.get(e, 'study.studyUid'),
                    seriesUid: _.get(e, 'study.seriesUid'),
                    patientId: _.get(e, 'study.patientId'),
                    orthancId: _.get(e, 'study.orthancStudyId'),
                    diagnosis: diagnosis.replace(/,/g, '\,'),
                    classProbs: probs.replace(/,/g, '\,'),
                }
            })
        )
    }

    async downloadKaggleCSV(experimentId: number, user:User) {
        let experiment = await this.experimentRepository.findOne({id: experimentId, user: user.id})

        let evals = await this.evalService.evalRepository.find({user: user.id})

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

    async addAllToExperiment(experimentId: number, user:User, searchString: string='', studyType: StudyType, modality: string = '') {
        let query = this.studyRepository.createQueryBuilder('study')
        .leftJoin('experiment_studies_study', 'es', 'es.studyId = study.id')
        .where({user})
        .andWhere('es."experimentId" is null')

        
        if(searchString) {
            query = query
                .andWhere(`"patientId" ILIKE '%${searchString}%'
                            OR "orthancStudyId" ILIKE '%${searchString}%'
                            OR "type" ILIKE '%${searchString}%'
                            OR "modality" ILIKE '%${searchString}%'`)    
        } 
        if(studyType) query = query.andWhere(`study.type = '${studyType}'`)
        if(modality) query = query.andWhere(`study.modality = '${modality}'`) 
        let studies = await query.getMany()
        await this.addStudiesToExperiment(experimentId, studies.map(s=>s.id), user)

        return {}
    }


    async getExperimentStats(experimentId: number, user: User) {
        let experiment = await this.experimentRepository.findOne({id:experimentId, user: user.id});
        let studyIds = experiment.studies.map(s => s.id)
        let evals = await this.evalService.getEvalsByStudyIds(studyIds,user)
        let labels = await this.studyService.getLabelsByStudyIds(studyIds, user)
        return this.experimentFactory.buildEvalStats(evals, labels, experiment.model, experiment)
    }
}