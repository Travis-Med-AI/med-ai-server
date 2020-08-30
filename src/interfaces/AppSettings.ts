export interface ExternalService {
    host: string;
    port: number;
}

export interface AppSettings {
    secret: string,
    port: number,
    rabbitMq: ExternalService,
    redis: ExternalService,
    orthanc: ExternalService,
    logstash: ExternalService,
    imageSaveLocation: string
}