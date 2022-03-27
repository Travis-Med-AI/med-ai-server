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
import { User } from "../entity/User.entity";
import { UserService } from "./user.service";


@injectable()
export class RealtimeService {
    channel: amqp.Channel;
    connection: amqp.Connection;
    notificationRepository = this.db.getRepository<Notification>(Notification);

    constructor(
        @inject(TYPES.SocketClient) public socket: Socket,
        @inject(TYPES.AppSettingsService) private appSettings: AppSettingsService,
        @inject(TYPES.Logger) private logger: Logger,
        @inject(TYPES.RealtimeFactory) private realtimeFactory: RealtimeFactory,
        @inject(TYPES.DatabaseService) private db: DatabaseService,
        @inject(TYPES.UserService) private userService: UserService,
    ) {
    }

    async sendNotification(message: string, type: Notifications, userId:number) {
        if(!_.includes(Object.values(Notifications), type)) {
            throw new Error('invalid notification')
        }
        let notificationDb;
        let user = await this.userService.getUser(userId)
        if(type != Notifications.connected) {
            notificationDb = await this.saveNotification(message, type, false, user)
        }
        let id = _.get(notificationDb, 'id', -1)

        let notification = this.realtimeFactory.buildNotification(message, type, id, userId)
        console.log('sedning notification', JSON.stringify(notification))
        this.socket.emit(Sockets.notifications, notification);
        let notifications = []
        if (user) {
            notifications = await this.getNotifications(user);
            this.socket.emit(Sockets.allNotifications, notifications)
        }
    }

    async sendModelLog(msg: ModelLogMessage) {
        console.log(`sending model log for ${msg.evalId}`)
        this.socket.emit(`${Sockets.modelLog}-${msg.evalId}`, msg)
    }

    async getChannel() {
        if(this.connection){
            this.connection.close()
            console.log('closing connection')
        }
        this.connection = await amqp.connect(await this.appSettings.getRabbitMqUrl())
        let channel = await this.connection.createChannel()
        this.channel = channel;
        console.log('getting channel')
    }

    async setupRabbitMq() {
        // connect to rabbitmq
        await this.getChannel()
        this.handleModelLogs()
        this.handleNotifications()
    }

    handleNotifications() {
        let queue = 'notifications';      
        this.channel.assertQueue(queue, {
            durable: false
        });
        this.channel.consume(queue, (msg) => {
            let message: NotificationMessage = JSON.parse(msg.content.toString())
            this.sendNotification(message.message, message.type, message.userId).then(n => {
                console.log(`Socketio emitted message: ${msg.content.toString()}`)
                this.logger.info(`Socketio emitted message: ${msg.content.toString()}`)
            })
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

    async saveNotification(message: string, type: Notifications, read:boolean, user: User) {
        let notifDB = this.realtimeFactory.buildNotificationModel(message, type, read, _.get(user, 'id', null));
        return this.notificationRepository.save(notifDB)
    }

    async readNotification(notificationId: number, user: User): Promise<NotificationMessage[]> {
        await this.notificationRepository.update({id: notificationId, user: user.id}, { read: true})
        let allNotifications = await this.getNotifications(user);
        this.socket.emit(Sockets.allNotifications, allNotifications);
        return allNotifications;
    }

    async readAllNotifications(user: User): Promise<NotificationMessage[]> {
        await this.notificationRepository.update({user: user.id}, {read: true})
        let allNotifications = await this.getNotifications(user);
        this.socket.emit(Sockets.allNotifications, allNotifications);
        return allNotifications;
    }

async getNotifications(user: User): Promise<NotificationMessage[]> {
        let notifs = await this.notificationRepository.find({read: false, user: user.id})
        return notifs.map(n => this.realtimeFactory.buildNotification(n.message, n.type, n.id, user.id))
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