import { injectable, inject } from "inversify";
import { TYPES } from "../constants/types";
import { AppSettingsService } from "./appSettings.service";
import { Socket } from "socket.io";
import { Logger } from "log4js";
import * as amqp from 'amqplib';
import { Sockets, NotificationMessage, Notifications, ModelLogMessage } from 'med-ai-common';
import _ from 'lodash'
import { DatabaseService } from "./database.service";
import { Notification } from "../entity/Notification.entity";
import { RealtimeFactory } from "../factories/realtime.factory";
import { ModelMessage } from "../interfaces/ModelMessage";


@injectable()
export class RealtimeService {
    channel: amqp.Channel;
    notificationRepository = this.db.getRepository<Notification>(Notification);

    constructor(
        @inject(TYPES.SocketClient) public socket: Socket,
        @inject(TYPES.AppSettingsService) private appSettings: AppSettingsService,
        @inject(TYPES.Logger) private logger: Logger,
        @inject(TYPES.RealtimeFactory) private realtimeFactory: RealtimeFactory,
        @inject(TYPES.DatabaseService) private db: DatabaseService,
    ) {
    }

    async sendNotification(message: string, type: Notifications) {
        if(!_.includes(Object.values(Notifications), type)) {
            throw new Error('invalid notification')
        }
        let notificationDb;
        if(type != Notifications.connected) {
            notificationDb = await this.saveNotification(message, type, false)
        }
        let id = _.get(notificationDb, 'id', -1)

        let notification = this.realtimeFactory.buildNotification(message, type, id)

        this.socket.emit(Sockets.notifications, notification);
        
        let allNotifications = await this.getNotifications();
        this.socket.emit(Sockets.allNotifications, allNotifications)
    }

    async sendModelLog(msg: ModelLogMessage) {
        console.log(`sending model log for ${msg.evalId}`)
        this.socket.emit(`${Sockets.modelLog}-${msg.evalId}`, msg)
    }

    async getChannel() {
        let connection = await amqp.connect(await this.appSettings.getRabbitMqUrl())
        let channel = await connection.createChannel()
        this.channel = channel;
    }

    async setupRabbitMq() {
        // connect to rabbitmq
        await this.getChannel()
        this.handleNotifications()
        this.handleModelLogs()
    }

    handleNotifications() {
        let queue = 'notifications';      
        this.channel.assertQueue(queue, {
            durable: false
        });
        this.channel.consume(queue, (msg) => {
            let message: NotificationMessage = JSON.parse(msg.content.toString())
            this.sendNotification(message.message, message.type).then(n => 
                this.logger.info(`Socketio emitted message: ${msg.content.toString()}`))

        }, {noAck:true})
    }

    handleModelLogs() {
        let queue = 'model_log';      
        this.channel.assertQueue(queue, {
            durable: false
        });
        this.channel.consume(queue, (msg) => {
            let message: ModelLogMessage = JSON.parse(msg.content.toString())
            this.sendModelLog(message).then(n => 
                this.logger.info(`Socketio emitted message: ${msg.content.toString()}`))

        }, {noAck:true})
    }

    async saveNotification(message: string, type: Notifications, read:boolean) {
        let notifDB = this.realtimeFactory.buildNotificationModel(message, type, read);
        return this.notificationRepository.save(notifDB)
    }

    async readNotification(notificationId: number): Promise<NotificationMessage[]> {
        await this.notificationRepository.update({id: notificationId}, { read: true})
        let allNotifications = await this.getNotifications();
        this.socket.emit(Sockets.allNotifications, allNotifications);
        return allNotifications;
    }

    async readAllNotifications(): Promise<NotificationMessage[]> {
        await this.notificationRepository.update({}, {read: true})
        let allNotifications = await this.getNotifications();
        this.socket.emit(Sockets.allNotifications, allNotifications);
        return allNotifications;
    }

    async getNotifications(): Promise<NotificationMessage[]> {
        let notifs = await this.notificationRepository.find({read: false})
        return notifs.map(n => this.realtimeFactory.buildNotification(n.message, n.type, n.id))
    }

    async sendModelMessage(queueName, message: ModelMessage) {
        if (!this.channel) {
            await this.getChannel()
        }
        let queue = await this.channel.assertQueue(queueName, {
            durable: false
        });
        console.log('Sending message to queue', `queue: ${queueName}`, `message: ${message}` )
        this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
    }


}