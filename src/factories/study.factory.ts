import { injectable } from 'inversify';
import { User } from '../entity/User.entity';
import { csvVerification, StudyViewModel } from 'med-ai-common';
import { Role } from '../entity/Role.entity';
import { Study } from '../entity/Study.entity';
import { Dictionary } from 'lodash';
import { LabelRow } from '../interfaces/LabelCSV';
import { StudyLabel } from '../entity/StudyLabel.entity';
import { Model } from '../entity/Model.entity';


@injectable()
export class StudyFactory {

    buildStudyViewModel(study: Study): StudyViewModel {
        return {
            id: study.id,
            orthancStudyId: study.orthancStudyId,
            patientId: study.patientId,
            seriesUid: study.seriesUid,
            studyUid: study.studyUid,
            type: study.type,
            modality: study.modality,
            failed: study.failed,
            lastUpdate: study.lastUpdate
        }
    }

    buildCSVVerification(idsFound: number, csv: LabelRow[], outputKeys: string[]): csvVerification {
        let keysFound: {key: string,count: number}[] = []
        outputKeys.forEach( o => {
            keysFound.push({key: o, count: csv.filter(r => r.labels[o]).length})
        })

        return {
            idsFound,
            keysFound
        }
    }

    buildLabelRow(headers: string[], row: string[]): LabelRow{
        let seriesUIDIndex = headers.findIndex(i => i == 'Series UID')
        let seriesUID = row[seriesUIDIndex].trim()
        row.splice(seriesUIDIndex, 1)
        headers.splice(seriesUIDIndex, 1)

        let labels = {}
        headers.forEach((k,i) => labels[k] = row[i]);
        return {
            seriesUID,
            labels
        }
    }

    buildStudyLabel(labelRow: LabelRow, series: Study, model: Model):StudyLabel {
        let filteredLabels = {}
        console.log(typeof model.outputKeys)
        model.outputKeys.forEach(k => {
            if(k in labelRow.labels) {
                filteredLabels[k] = labelRow.labels[k]
            }
        })
        return {
            model,
            study: series,
            label: filteredLabels,
        }
    }

}