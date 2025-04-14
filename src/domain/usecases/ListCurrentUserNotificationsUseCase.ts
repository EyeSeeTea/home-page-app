import _ from "lodash";
import { NotificationListOptions, NotificationRepository } from "../repositories/NotificationRepository";
import { FutureData } from "../types/Future";
import { Notification, NotificationWildcard } from "../entities/Notification";
import { UserRepository } from "../repositories/UserRepository";
import { User } from "../entities/User";

export class ListCurrentUserNotificationsUseCase {
    constructor(private notificationRepository: NotificationRepository, private userRepository: UserRepository) {}

    public execute(): FutureData<Notification[]> {
        const notificationFilter: NotificationListOptions = {
            wildcard: [NotificationWildcard.ALL, NotificationWildcard.WEB, NotificationWildcard.Both],
        };
        return this.userRepository
            .getCurrentUser()
            .flatMap(user =>
                this.notificationRepository.list(notificationFilter).map(notifications => ({ user, notifications }))
            )
            .map(({ user, notifications }) => this.filterUserNotifications(notifications, user));
    }

    private filterUserNotifications(notifications: Notification[], user: User): Notification[] {
        return _(notifications)
            .filter(notification => this.isForUser(notification, user))
            .value();
    }

    private isForUser(notification: Notification, user: User): boolean {
        if (!user || notification.recipients.wildcard === NotificationWildcard.ALL) return true;

        const isForUser = notification.recipients.users.some(({ id }) => id === user.id);
        const isForGroup = notification.recipients.userGroups.some(({ id }) =>
            user.userGroups.some(group => id === group.id)
        );
        const notifForUser = isForUser || isForGroup;

        const isRead = notification.readBy.some(({ id }) => id === user.id);
        return notifForUser && !isRead;
    }
}
