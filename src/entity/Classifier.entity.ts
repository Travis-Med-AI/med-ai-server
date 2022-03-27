import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn} from "typeorm";
import { Model } from "./Model.entity";
import { User } from "./User.entity";

@Entity()
export class Classifier {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Model, {eager: true})
    @JoinColumn()
    model: Model;

    @Column({unique: true})
    modality: string;

    @ManyToOne(type => User, user => user.id, {onUpdate: 'CASCADE', onDelete: 'CASCADE' })
    @JoinColumn()
    user: number;

    @Column({type: 'timestamp', precision: 3, default: () => "CURRENT_TIMESTAMP(3)", onUpdate: "CURRENT_TIMESTAMP(3)"})
    lastRun: number;
}
