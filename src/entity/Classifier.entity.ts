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
}
