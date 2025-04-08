import { UseCase } from "./UseCase";
import { NotificationRepository } from "../repositories/NotificationRepository";
import { Future, FutureData } from "../types/Future";
import { User } from "../entities/User";
import { Notification } from "../entities/Notification";
import { UserRepository } from "../repositories/UserRepository";

export class ReadCurrentUserNotifications implements UseCase {
    constructor(private notificationRepository: NotificationRepository, private userRepository: UserRepository) {}

    public execute(notifications: Notification[]): FutureData<void> {
        return this.userRepository.getCurrentUser().flatMap(user => this.readNotificationsAndSave(notifications, user));
    }

    private readNotificationsAndSave(notifications: Notification[], user: User): FutureData<void> {
        const readNotifications: Partial<Notification>[] = notifications.map(notification => ({
            id: notification.id,
            readBy: [{ id: user.id, name: user.name, date: new Date() }],
        }));
        return this.notificationRepository.save(readNotifications);
    }
}
