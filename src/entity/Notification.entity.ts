import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";
import { Notifications } from "med-ai-common";

@Entity()
export class Notification {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: Notifications;

    @Column()
    message: string;

    @Column()
    read: boolean;
}
