import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";
import { ROLES } from "med-ai-common";

@Entity()
export class Role {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: ROLES;

    @Column({nullable: true})
    description: string;
}
