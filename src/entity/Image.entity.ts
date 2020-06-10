import {Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable} from "typeorm";
import { ModelInputs } from "../enums/ModelInputs";
import { ModelOutputs } from "../enums/ModelOutputs";

@Entity()
export class Model {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    image: string;

    @Column()
    input: ModelInputs

    @Column()
    output: ModelOutputs
}
