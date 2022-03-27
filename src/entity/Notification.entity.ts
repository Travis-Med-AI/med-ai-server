import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn} from "typeorm";
import { Notifications } from "med-ai-common";
import { User } from "./User.entity";

@Entity()
export class Notification {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: Notifications;

    @Column()
    message: string;

    @ManyToOne(type => User, user => user.id, {onUpdate: 'CASCADE', onDelete: 'CASCADE', nullable:true })
    @JoinColumn()
    user: number;

    @Column()
    read: boolean;
}
