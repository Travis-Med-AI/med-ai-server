import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne, ManyToMany, JoinTable} from "typeorm";
import { Model } from "./Model.entity";
import { Study } from "./Study.entity";

@Entity()
export class ModelTrain {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(type => Study, { onDelete: 'CASCADE' })
    @JoinColumn()
    study: Study | number

    @ManyToOne(type => Model, model => model.id, {eager: true})
    @JoinColumn()
    model: Model;

    @Column({nullable: true, type: 'jsonb'})
    modelOutput: any;

    @Column({default: false})
    failed: boolean;
}
