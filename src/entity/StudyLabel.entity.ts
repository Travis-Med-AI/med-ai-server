import {Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, Unique} from "typeorm";
import { Study } from "./Study.entity";
import { ROLES } from "med-ai-common";

@Entity()
export class StudyLabel {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Study, {eager: true})
    @JoinColumn()
    study: number | Study;

    @Column({nullable: false, type: 'jsonb'})
    label: _.Dictionary<number>;
}
