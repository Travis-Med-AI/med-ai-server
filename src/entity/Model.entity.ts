import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn} from "typeorm";
import { ModelOutputs, StudyType, ModelInputs, Modality } from "med-ai-common";
import { User } from "./User.entity";

@Entity()
export class Model {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    image: string;

    @Column({unique: true})
    displayName: string;

    @Column()
    input: StudyType;

    @Column()
    modality: Modality;

    @Column({nullable: true})
    inputType: ModelInputs;

    @Column()
    output: ModelOutputs;

    @Column({nullable: true, type: 'jsonb'})
    outputKeys: any;

    @Column()
    hasImageOutput: boolean;

    @Column({default: false})
    pulled: boolean;

    @ManyToOne(type => User, user => user.id, {onUpdate: 'CASCADE', onDelete: 'CASCADE' })
    @JoinColumn()
    user: number;

    @Column({default: false})
    failedPull: boolean;

    @Column({default: 1})
    concurrency: number;
}
