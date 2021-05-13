import { injectable, inject } from "inversify";
import { Connection, Repository } from "typeorm";
import { TYPES } from "../constants/types";
import * as Celery from 'celery-ts';
import { AppSettingsService } from "./appSettings.service";


@injectable()
export class DatabaseService {



    constructor(
        @inject(TYPES.DatabaseConnection) private connection: Connection,
        @inject(TYPES.AppSettingsService) private settingsService: AppSettingsService,
    ) {
    }

    getRepository<T>(entity):Repository<T> {
        return this.connection.getRepository(entity);
    }

    startCeleryTask(taskName: string, args: any[]) {
        let celeryClient = Celery.createClient({
            brokerUrl: this.settingsService.getRabbitMqUrl(),
            resultBackend: this.settingsService.getRedisUrl(),
        });
        const task: Celery.Task<string> = celeryClient.createTask<string>(taskName);

        task.applyAsync({
            args: args,
            kwargs: {}
        });
    }

}