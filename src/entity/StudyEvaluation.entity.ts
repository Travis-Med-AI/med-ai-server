import {Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, Unique} from "typeorm";
import { Model } from "./Model.entity";
import { EvaluationStatus } from "../enums/EvaluationStatus";
import { Study } from "./Study.entity";


@Entity()
@Unique(['model', 'study'])
export class StudyEvaluation {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Study, study => study.patientId, {eager: true})
    @JoinColumn()
    study: number;

    @Column({nullable: true, type: 'jsonb'})
    modelOutput: any;

    @ManyToOne(type => Model)
    @JoinColumn()
    model: number | Model

    @Column()
    status: EvaluationStatus

    @Column({nullable: true})
    imgOutputPath: string

    @Column({type: 'timestamp', precision: 3, default: () => "CURRENT_TIMESTAMP(3)", onUpdate: "CURRENT_TIMESTAMP(3)"})
    lastUpdate: number;
}
