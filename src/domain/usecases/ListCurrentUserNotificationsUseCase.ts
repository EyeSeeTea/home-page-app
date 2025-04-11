import { NotificationRepository } from "../repositories/NotificationRepository";
import { FutureData } from "../types/Future";
import { Notification, NotificationWildcard } from "../entities/Notification";
import { UserRepository } from "../repositories/UserRepository";

export class ListCurrentUserNotificationsUseCase {
    constructor(private notificationRepository: NotificationRepository, private userRepository: UserRepository) {}

    public execute(): FutureData<Notification[]> {
        return this.userRepository.getCurrentUser().flatMap(user => {
            return this.notificationRepository.list({
                user: user,
                isRead: false,
                wildcard: [NotificationWildcard.ALL, NotificationWildcard.WEB],
            });
        });
    }
}
