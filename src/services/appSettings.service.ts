import { injectable, inject } from "inversify";
import { Connection, createConnection, Repository } from "typeorm";
import { TYPES } from "../constants/types";
import { APP_SETTINGS } from "../constants/appSettings";
import { AppSettings } from "../interfaces/AppSettings";


@injectable()
export class AppSettingsService {
    appSettings = APP_SETTINGS
    constructor(
    ) {

    }

    getSettings() {
        this.appSettings.orthanc.host = process.env.ORTHANC_HOST || this.appSettings.orthanc.host;
        this.appSettings.redis.host = process.env.REDIS_HOST || this.appSettings.orthanc.host;
        this.appSettings.rabbitMq.host = process.env.RABBITMQ_HOST || this.appSettings.orthanc.host;
    }

    getRedisUrl() {
        return `redis://${this.appSettings.redis.host}:${this.appSettings.redis.port}`
    }

    getRabbitMqUrl() {
        return `amqp://${this.appSettings.rabbitMq.host}:${this.appSettings.rabbitMq.port}`
    }

    getOrthancUrl() {
        return `http://${this.appSettings.orthanc.host}:${this.appSettings.orthanc.port}`
    }

}