import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne, ManyToMany, JoinTable} from "typeorm";
import { Model } from "./Model.entity";
import { Study } from "./Study.entity";
import { User } from "./User.entity";

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

    @ManyToOne(type => User, user => user.id, {onUpdate: 'CASCADE', onDelete: 'CASCADE' })
    @JoinColumn()
    user: number;

    @Column({nullable: true, type: 'jsonb'})
    modelOutput: any;

    @Column({default: false})
    failed: boolean;
}
