import { UseCase } from "./UseCase";
import { NotificationRepository } from "../repositories/NotificationRepository";
import { FutureData } from "../types/Future";
import { Notification, NotificationWildcard } from "../entities/Notification";
import { UserRepository } from "../repositories/UserRepository";

export class ListCurrentUserNotificationsUseCase implements UseCase {
    constructor(private notificationRepository: NotificationRepository, private userRepository: UserRepository) {}

    public execute(): FutureData<Notification[]> {
        return this.userRepository.getCurrentUser().flatMap(user => {
            return this.notificationRepository.list({
                user,
                isRead: false,
                wildcard: [NotificationWildcard.ALL, NotificationWildcard.WEB],
            });
        });
    }
}
