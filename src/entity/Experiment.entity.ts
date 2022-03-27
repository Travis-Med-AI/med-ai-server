import {Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, Unique, ManyToMany, JoinTable, OneToOne, OneToMany} from "typeorm";
import { Model } from "./Model.entity";
import { ExperimentStatus, StudyType } from "med-ai-common";
import { Study } from "./Study.entity";
import { User } from "./User.entity";


@Entity()
export class Experiment {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToMany(type => Study, {
        cascade: true,
        eager: true
    })
    @JoinTable()
    studies: Study[]

    @Column({unique: true})
    name: string

    @Column('text')
    type: StudyType;

    @Column('text', {default: ExperimentStatus.NEW})
    status: ExperimentStatus;

    @ManyToOne(type => Model, 
               { eager: true, nullable: true })
    @JoinColumn()
    model: Model

    @ManyToOne(type => User, user => user.id, {cascade: true})
    @JoinColumn()
    user: number;

    @Column({type: 'timestamp', precision: 3, default: () => "CURRENT_TIMESTAMP(3)"})
    createdDate: number;

    @Column({type: 'timestamp', precision: 3, default: () => "CURRENT_TIMESTAMP(3)", onUpdate: "CURRENT_TIMESTAMP(3)"})
    lastUpdate: number;
}
