import { injectable, inject } from "inversify";
import { Connection, Repository } from "typeorm";
import { TYPES } from "../constants/types";
import * as Celery from 'celery-ts';
import { AppSettingsService } from "./appSettings.service";
import { Socket } from "socket.io";

export enum SocketRoutes {
    notification = 'notification'
}

@injectable()
export class RealtimeService {
    constructor(
        @inject(TYPES.SocketClient) private socket: Socket,
    ) {
    }

    sendNotification(message: string) {
        this.socket.emit(SocketRoutes.notification, message)
    }
}