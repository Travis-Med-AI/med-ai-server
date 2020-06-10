import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn} from "typeorm";
import { EvalJobStatus } from "../enums/EvalJobStatus";
import { Model } from "./Image.entity";

@Entity()
export class EvalJob {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Model)
    @JoinColumn()
    model: number | Model

    @Column()
    status: EvalJobStatus;

    @Column({nullable: true, type: 'float'})
    endTime: number;

    @Column({type: 'timestamp', precision: 3, default: () => "CURRENT_TIMESTAMP(3)", onUpdate: "CURRENT_TIMESTAMP(3)"})
    lastRun: number;
}
