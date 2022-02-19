import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne, ManyToMany, JoinTable} from "typeorm";
import { Model } from "./Model.entity";
import { Study } from "./Study.entity";

@Entity()
export class StudyLabel {

    @PrimaryGeneratedColumn()
    id?: number;

    @ManyToOne(type => Study, study => study.id, {eager: true})
    @JoinColumn()
    study: Study;

    @ManyToOne(type => Model, model => model.id, {eager: true})
    @JoinColumn()
    model: Model;

    @Column({type: 'jsonb'})
    label: any;
}
