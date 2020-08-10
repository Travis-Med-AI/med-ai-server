import { injectable } from 'inversify';
import { User } from '../entity/User.entity';
import { StudyViewModel } from 'med-ai-common';
import { Role } from '../entity/Role.entity';
import { Study } from '../entity/Study.entity';


@injectable()
export class StudyFactory {

    buildStudyViewModel(study: Study): StudyViewModel {
        return {
            id: study.id,
            orthancStudyId: study.orthancStudyId,
            patientId: study.patientId,
            type: study.type,
            modality: study.modality,
            failed: study.failed,
            lastUpdate: study.lastUpdate
        }
    }

}