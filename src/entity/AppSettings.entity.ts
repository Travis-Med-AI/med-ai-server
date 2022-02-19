import {Entity, PrimaryGeneratedColumn, Column } from "typeorm";


@Entity()
export class AppSettings {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: true})
    orthancUrl: string;

    @Column({nullable: true})
    rabbitmqUrl: string;    
    
    @Column({nullable: true})
    redisUrl: string;

    @Column({type: 'timestamp', precision: 3, default: () => "CURRENT_TIMESTAMP(3)", onUpdate: "CURRENT_TIMESTAMP(3)"})
    lastUpdate: number;
}
