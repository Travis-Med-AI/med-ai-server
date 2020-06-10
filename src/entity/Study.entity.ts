import {Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne} from "typeorm";
import { Model } from "./Image.entity";
import { EvaluationStatus } from "../enums/EvaluationStatus";


@Entity()
export class StudyEvaluation {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    patient: string;

    @Column({nullable: true, type: 'jsonb'})
    modelOutput: any;

    @ManyToOne(type => Model)
    @JoinColumn()
    model: number | Model

    @Column()
    status: EvaluationStatus

    @Column({type: 'timestamp', precision: 3, default: () => "CURRENT_TIMESTAMP(3)", onUpdate: "CURRENT_TIMESTAMP(3)"})
    lastUpdate: number;
}
