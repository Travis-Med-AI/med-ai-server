import {Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable} from "typeorm";
import { ModelOutputs } from "../enums/ModelOutputs";
import { StudyType } from "../enums/StudyType";
import { ModelInputs } from "../enums/ModelInputs";
import { Modality } from "../enums/Modality";

@Entity()
export class Model {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    image: string;

    @Column()
    input: StudyType;

    @Column()
    modality: Modality;

    @Column({nullable: true})
    inputType: ModelInputs;

    @Column()
    output: ModelOutputs;

    @Column()
    hasImageOutput: boolean;
}
