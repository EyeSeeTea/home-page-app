import { NotificationRepository } from "../repositories/NotificationRepository";
import { FutureData } from "../types/Future";
import { Notification } from "../entities/Notification";
import { User } from "../entities/User";

export class ReadUserNotificationUseCase {
    constructor(private notificationRepository: NotificationRepository) {}

    public execute(notifications: Notification[], user: User): FutureData<void> {
        // assume user saving the notification has read it
        const updatedNotifs = Notification.readAllNotifications(notifications, user);
        return this.notificationRepository.save(updatedNotifs);
    }
}
