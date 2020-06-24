import {Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne} from "typeorm";
import { Model } from "./Model.entity";
import { EvaluationStatus } from "../enums/EvaluationStatus";
import { StudyType } from "../enums/StudyType";


@Entity()
export class Study {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique:true})
    orthancStudyId: string;

    @Column({nullable: true})
    patientId: string;

    @Column('text', {nullable: true})
    type: StudyType;

    @Column({default: () => false})
    failed: boolean;

    @Column({type: 'timestamp', precision: 3, default: () => "CURRENT_TIMESTAMP(3)", onUpdate: "CURRENT_TIMESTAMP(3)"})
    lastUpdate: number;
}
