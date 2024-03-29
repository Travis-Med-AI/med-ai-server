import {Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, Unique} from "typeorm";
import { Model } from "./Model.entity";
import { EvaluationStatus } from "med-ai-common";
import { Study } from "./Study.entity";
import { User } from "./User.entity";


@Entity()
@Unique(['model', 'study'])
export class StudyEvaluation {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Study, study => study.patientId, {eager: true})
    @JoinColumn()
    study: Study;

    @Column({nullable: true, type: 'jsonb'})
    modelOutput: any;

    @Column({nullable: true, type: 'jsonb'})
    stdout: any;

    @ManyToOne(type => Model, { onDelete: 'CASCADE' })
    @JoinColumn()
    model: number | Model

    @Column()
    status: EvaluationStatus

    @Column({nullable: true})
    imgOutputPath: string

    @Column({nullable: true})
    startTime: number

    @Column({nullable: true})
    finishTime: number

    @Column({type: 'timestamp', precision: 3, default: () => "CURRENT_TIMESTAMP(3)", onUpdate: "CURRENT_TIMESTAMP(3)"})
    lastUpdate: number;
}
