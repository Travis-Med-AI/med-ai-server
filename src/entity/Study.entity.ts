import {Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { StudyType } from "med-ai-common";


@Entity()
export class Study {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique:true})
    orthancStudyId: string;

    @Column({nullable: true})
    patientId: string;

    @Column('text', {nullable: true})
    type: StudyType;    
    
    @Column( {nullable: true})
    modality: string;

    @Column({default: () => false})
    failed: boolean;

    @Column({type: 'timestamp', precision: 3, default: () => "CURRENT_TIMESTAMP(3)", onUpdate: "CURRENT_TIMESTAMP(3)"})
    lastUpdate: number;
}
