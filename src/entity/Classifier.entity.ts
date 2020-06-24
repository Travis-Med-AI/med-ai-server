import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn} from "typeorm";
import { EvalJobStatus } from "../enums/EvalJobStatus";
import { Model } from "./Model.entity";

@Entity()
export class Classifier {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Model, {eager: true})
    @JoinColumn()
    model: Model;

    @Column({type: 'timestamp', precision: 3, default: () => "CURRENT_TIMESTAMP(3)", onUpdate: "CURRENT_TIMESTAMP(3)"})
    lastRun: number;
}
