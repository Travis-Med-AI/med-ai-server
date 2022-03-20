import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";
import { ModelOutputs, StudyType, ModelInputs, Modality } from "med-ai-common";

@Entity()
export class Model {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    image: string;

    @Column({unique: true})
    displayName: string;

    @Column()
    input: StudyType;

    @Column()
    modality: Modality;

    @Column({nullable: true})
    inputType: ModelInputs;

    @Column()
    output: ModelOutputs;

    @Column({nullable: true, type: 'jsonb'})
    outputKeys: any;

    @Column()
    hasImageOutput: boolean;

    @Column({default: false})
    pulled: boolean;

    @Column({default: false})
    failedPull: boolean;

    @Column({default: 1})
    concurrency: number;
}
