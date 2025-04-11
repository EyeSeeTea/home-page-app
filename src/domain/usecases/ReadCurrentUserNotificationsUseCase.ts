import { NotificationRepository } from "../repositories/NotificationRepository";
import { FutureData } from "../types/Future";
import { User } from "../entities/User";
import { Notification } from "../entities/Notification";
import { UserRepository } from "../repositories/UserRepository";
import _ from "lodash";

export class ReadCurrentUserNotificationsUseCase {
    constructor(private notificationRepository: NotificationRepository, private userRepository: UserRepository) {}

    public execute(notifications: Notification[]): FutureData<void> {
        return this.userRepository
            .getCurrentUser()
            .flatMap(user => this.updateNotificationsAsRead(notifications, user))
            .flatMap(updatedNotifs => this.notificationRepository.save(updatedNotifs));
    }

    private updateNotificationsAsRead(notifications: Notification[], user: User): FutureData<Notification[]> {
        const notificationMap = _.keyBy(notifications, notification => notification.id);
        return this.notificationRepository
            .list(null)
            .map(allNotifications => allNotifications.filter(notification => !!notificationMap[notification.id]))
            .map(notificationsToUpdate =>
                notificationsToUpdate.map(notification => this.markAsRead(notification, user))
            );
    }

    private markAsRead(notification: Notification, user: User): Notification {
        return {
            ...notification,
            readBy: [
                ...notification.readBy,
                {
                    id: user.id,
                    name: user.name,
                    date: new Date(),
                },
            ],
        };
    }
}
