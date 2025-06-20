import _ from "lodash";
import { NotificationListOptions, NotificationRepository } from "../repositories/NotificationRepository";
import { FutureData } from "../types/Future";
import { Notification, NotificationWildcard } from "../entities/Notification";
import { User } from "../entities/User";

export class ListUserNotificationsUseCase {
    constructor(private notificationRepository: NotificationRepository) {}

    public execute(user: User): FutureData<Notification[]> {
        const notificationFilter: NotificationListOptions = {
            wildcard: [NotificationWildcard.ALL, NotificationWildcard.WEB, NotificationWildcard.BOTH],
        };
        return this.notificationRepository
            .list(notificationFilter)
            .map(notifications => this.filterUserNotifications(notifications, user));
    }

    private filterUserNotifications(notifications: Notification[], user: User): Notification[] {
        return _(notifications)
            .filter(notification => this.isForUser(notification, user))
            .orderBy(notification => notification.createdAt, "desc")
            .value();
    }

    private isForUser(notification: Notification, user: User): boolean {
        if (notification.isReadBy(user)) return false;

        if (!user || notification.recipients.wildcard === NotificationWildcard.ALL) return true;

        const isForUser = notification.recipients.users.some(({ id }) => id === user.id);
        const isForGroup = notification.recipients.userGroups.some(({ id }) =>
            user.userGroups.some(group => id === group.id)
        );
        return isForUser || isForGroup;
    }
}
