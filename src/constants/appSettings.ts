import { AppSettings } from "../interfaces/AppSettings";

export const APP_SETTINGS: AppSettings = {
    secret: 'supersecret',
    port: 8000,
    rabbitMq: {
        host: 'localhost',
        port: 5672
    },
    redis: {
        host: 'localhost',
        port: 6379
    },
    orthanc: {
        host: 'localhost',
        port: 8042
    },
    logstash: {
        host: 'localhost',
        port: 5000
    },
    imageSaveLocation: '/opt/images/'
}