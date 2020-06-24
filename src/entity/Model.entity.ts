import {Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable} from "typeorm";
import { ModelOutputs } from "../enums/ModelOutputs";
import { StudyType } from "../enums/StudyType";

@Entity()
export class Model {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    image: string;

    @Column()
    input: StudyType

    @Column({nullable: true})
    inputType: StudyType

    @Column()
    output: ModelOutputs

    @Column()
    hasImageOutput: boolean
}
