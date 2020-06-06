import {Entity, PrimaryGeneratedColumn, Column, ManyToMany} from "typeorm";
import { User } from "./User.entity";
import { ROLES } from "../enums/roles";

@Entity()
export class Role {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: ROLES;

    @Column({nullable: true})
    description: string;
}
