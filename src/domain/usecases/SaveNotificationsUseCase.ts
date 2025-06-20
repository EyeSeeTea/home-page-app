import { NotificationRepository } from "../repositories/NotificationRepository";
import { FutureData } from "../types/Future";
import { Notification } from "../entities/Notification";
import { User } from "../entities/User";

export class SaveNotificationsUseCase {
    constructor(private notificationRepository: NotificationRepository) {}

    public execute(notifications: Notification[], user: User): FutureData<void> {
        //assume user saving the notification has read it
        const updatedNotifs = notifications.map(notification => notification.markAsRead(user));
        return this.notificationRepository.save(updatedNotifs);
    }
}
