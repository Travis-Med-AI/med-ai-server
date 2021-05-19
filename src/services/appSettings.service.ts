import { AppSettings } from "../entity/AppSettings.entity";
import { inject, injectable } from "inversify";
import { APP_SETTINGS } from "../constants/appSettings";
import { TYPES } from "../constants/types";
import { DatabaseService } from "./database.service";
import * as Celery from 'celery-ts';
import * as _ from 'lodash';

@injectable()
export class AppSettingsService {
    settingsRepository = this.db.getRepository<AppSettings>(AppSettings);

    constructor(
        @inject(TYPES.DatabaseService) private db: DatabaseService,

    ) {
        this.getSettings()
    }

    async getSettings() {
        let settings = await this.settingsRepository.findOne() || {} as any;
        settings.redisUrl = process.env.REDIS_URL as string || _.get(settings, 'redisUrl', 'redis://redis:6379')
        settings.rabbitmqUrl = process.env.RABBITMQ_URL as string || _.get(settings, 'rabbitmqUrl', 'amqp://guest:guest@rabbitmq:5672')
        settings.orthancUrl = process.env.ORTHANC_URL as string || _.get(settings, 'orthancUrl', 'http://orthanc:8042')
        return settings
    }

    async getRedisUrl() {
        const settings = await this.getSettings()
        return settings.redisUrl
    }

    async getRabbitMqUrl() {
        const settings = await this.getSettings()
        return settings.rabbitmqUrl
    }

    async getOrthancUrl() {
        const settings = await this.getSettings()
        return settings.orthancUrl
    }

    async getLogstashUrl() {
        const settings = await this.getSettings()
        return `http://${APP_SETTINGS.logstash.host}:${APP_SETTINGS.logstash.port}`
    }

    async startCeleryTask(taskName: string, args: any[]) {
        let celeryClient = Celery.createClient({
            brokerUrl: await this.getRabbitMqUrl(),
            resultBackend: await this.getRedisUrl(),
        });
        const task: Celery.Task<string> = celeryClient.createTask<string>(taskName);

        task.applyAsync({
            args: args,
            kwargs: {}
        });
    }
}