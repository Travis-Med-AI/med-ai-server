import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, OneToOne} from "typeorm";
import { Model } from "./Model.entity";

@Entity()
export class EvalJob {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(type => Model, { onDelete: 'CASCADE', eager: true })
    @JoinColumn()
    model: Model

    @Column({default: 1})
    batchSize: number;

    @Column()
    running: boolean;

    @Column({default: false})
    cpu: boolean;

    @Column({default: 0})
    replicas: number

    @Column({type: 'timestamp', precision: 3, default: () => "CURRENT_TIMESTAMP(3)", onUpdate: "CURRENT_TIMESTAMP(3)"})
    lastRun: number;
}
