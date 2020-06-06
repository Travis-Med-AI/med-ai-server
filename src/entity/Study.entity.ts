import {Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne} from "typeorm";
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

    @OneToOne(type => Model)
    @JoinColumn()
    model: Model

    @Column()
    status: EvaluationStatus
}
