import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, OneToOne} from "typeorm";
import { EvalJobStatus } from "../enums/EvalJobStatus";
import { Model } from "./Model.entity";

@Entity()
export class EvalJob {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(type => Model)
    @JoinColumn()
    model: number | Model

    @Column()
    running: boolean;

    @Column({type: 'timestamp', precision: 3, default: () => "CURRENT_TIMESTAMP(3)", onUpdate: "CURRENT_TIMESTAMP(3)"})
    lastRun: number;
}
