import {Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable} from "typeorm";
import { ModelInputs } from "../enums/ModelInputs";
import { ModelOutputs } from "../enums/ModelOutputs";
import { StudyType } from "../enums/StudyType";

@Entity()
export class Model {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    image: string;

    @Column()
    input: ModelInputs

    @Column({nullable: true})
    inputType: StudyType

    @Column()
    output: ModelOutputs
}
