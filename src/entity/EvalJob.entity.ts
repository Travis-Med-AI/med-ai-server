import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, OneToOne} from "typeorm";
import { Model } from "./Model.entity";

@Entity()
export class EvalJob {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(type => Model)
    @JoinColumn()
    model: Model | number

    @Column({default: 1})
    batchSize: number;

    @Column()
    running: boolean;

    @Column({type: 'timestamp', precision: 3, default: () => "CURRENT_TIMESTAMP(3)", onUpdate: "CURRENT_TIMESTAMP(3)"})
    lastRun: number;
}
