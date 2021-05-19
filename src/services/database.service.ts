import { injectable, inject } from "inversify";
import { Connection, Repository } from "typeorm";
import { TYPES } from "../constants/types";
import { AppSettingsService } from "./appSettings.service";


@injectable()
export class DatabaseService {



    constructor(
        @inject(TYPES.DatabaseConnection) private connection: Connection,
    ) {
    }

    getRepository<T>(entity):Repository<T> {
        return this.connection.getRepository(entity);
    }



}