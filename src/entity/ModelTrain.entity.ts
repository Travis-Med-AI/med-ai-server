import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne} from "typeorm";
import { ModelOutputs, StudyType, ModelInputs, Modality } from "med-ai-common";
import { Model } from "./Model.entity";

@Entity()
export class ModelTrain {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(type => Model, { onDelete: 'CASCADE' })
    @JoinColumn()
    model: Model | number

    @Column({default: false})
    training: boolean;

    @Column({default: false})
    failed: boolean;
}
