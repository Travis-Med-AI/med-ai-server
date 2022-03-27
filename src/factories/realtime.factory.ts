import { User } from '../entity/User.entity';
import { Notifications, NotificationMessage } from 'med-ai-common';
import { injectable } from 'inversify';
import { Notification } from '../entity/Notification.entity';


@injectable()
export class RealtimeFactory {

    buildNotification(message: string, type: Notifications, id: number, userId:number): NotificationMessage {
        return { message, type, id, userId }
    }

    buildNotificationModel(message: string, type: Notifications, read = false, user:number): Notification {
        let notification = new Notification();
        notification.message = message;
        notification.type = type
        notification.read = read;
        notification.user = user;

        return notification;
    }
}