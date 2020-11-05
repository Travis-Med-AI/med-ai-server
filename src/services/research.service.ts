import { injectable, inject } from "inversify";
import { TYPES } from "../constants/types";
import { DatabaseService } from "./database.service";
import  {exec} from 'child_process'
import {promisify} from 'util';
const execAsync = promisify(exec);
import _ from 'lodash'
import { StudyLabel } from '../entity/StudyLabel.entity';

@injectable()
export class ResearchSerivice {
    studyLabelRepository = this.db.getRepository<StudyLabel>(StudyLabel);

    constructor(
        @inject(TYPES.DatabaseService) private db: DatabaseService,
    ) {}

    async saveLabel(studyId: number, label: _.Dictionary<number>) {
        let savedLabel = await this.studyLabelRepository.insert({study: studyId, label})
        return label
    }
}