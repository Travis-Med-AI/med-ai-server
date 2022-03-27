import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne} from "typeorm";
import { ModelOutputs, StudyType, ModelInputs, Modality } from "med-ai-common";
import { Model } from "./Model.entity";
import { User } from "./User.entity";

@Entity()
export class ModelTrain {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(type => Model, { onDelete: 'CASCADE' })
    @JoinColumn()
    model: Model | number

    @Column({default: false})
    training: boolean;

    @ManyToOne(type => User, user => user.id, {onUpdate: 'CASCADE', onDelete: 'CASCADE' })
    @JoinColumn()
    user: number;

    @Column({default: false})
    failed: boolean;
}
