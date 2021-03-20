import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn} from "typeorm";
import { Model } from "./Model.entity";

@Entity()
export class Classifier {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Model, {eager: true})
    @JoinColumn()
    model: Model;

    @Column({unique: true})
    modality: string;

    @Column({type: 'timestamp', precision: 3, default: () => "CURRENT_TIMESTAMP(3)", onUpdate: "CURRENT_TIMESTAMP(3)"})
    lastRun: number;
}
