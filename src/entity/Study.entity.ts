import {Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { StudyType, Modality } from "med-ai-common";


@Entity()
export class Study {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique:true})
    orthancStudyId: string;

    @Column({nullable: true})
    patientId: string;    
    
    @Column({nullable: true})
    studyUid: string;

    @Column({nullable: true})
    accession: string;

    @Column({nullable: true})
    seriesUid: string;

    @Column('text', {nullable: true})
    type: StudyType;    
    
    @Column( {nullable: true})
    modality: Modality;

    @Column( {nullable: true})
    description: string;

    @Column({default: () => false})
    failed: boolean;

    @Column({type: 'timestamp', precision: 3, default: () => "CURRENT_TIMESTAMP(3)"})
    dateAdded: number;

    @Column({type: 'timestamp', precision: 3, default: () => "CURRENT_TIMESTAMP(3)", onUpdate: "CURRENT_TIMESTAMP(3)"})
    lastUpdate: number;
}
