import _ from "lodash";

import { NotificationListOptions, NotificationRepository } from "../../domain/repositories/NotificationRepository";
import { Future, FutureData } from "../../domain/types/Future";
import { Notification, NotificationWildcard, NotificationWildcardType } from "../../domain/entities/Notification";
import { Instance } from "../entities/Instance";
import { DataStoreStorageClient } from "../clients/storage/DataStoreStorageClient";
import { notificationsDataStore } from "../clients/storage/Namespaces";
import { StorageClient } from "../clients/storage/StorageClient";
import { Maybe } from "../../types/utils";
import i18n from "../../utils/i18n";

export class NotificationDefaultRepository implements NotificationRepository {
    private storageClient: StorageClient;

    constructor(instance: Instance) {
        this.storageClient = new DataStoreStorageClient("global", instance, notificationsDataStore);
    }

    public list(options: NotificationListOptions): FutureData<Notification[]> {
        return this._get()
            .map(notifications => this.filterNotifications(notifications, options))
            .flatMapError(error => {
                console.error(`Notification (list): ${error}`);
                return Future.error(i18n.t("An error has occurred fetching notifications"));
            });
    }

    public save(notifications: Partial<Notification>[]): FutureData<void> {
        return this.list(null)
            .map(existingNotifs => this.updateNotifications(existingNotifs, notifications))
            .flatMap(updatedNotifications => this._save(updatedNotifications))
            .flatMapError(error => {
                console.error(`Notification (save): ${error}`);
                return Future.error(i18n.t("An error has occurred while saving notifications"));
            });
    }

    private _get(): FutureData<Notification[]> {
        return Future.fromPromise(this.storageClient.listObjectsInCollection<Notification>(notificationsDataStore));
    }

    private _save(notifications: Notification[]): FutureData<void> {
        return Future.fromPromise(
            this.storageClient.saveObjectsInCollection<Notification>(notificationsDataStore, notifications)
        );
    }

    private filterNotifications(notifications: Notification[], options: NotificationListOptions): Notification[] {
        return _(notifications)
            .filter(
                notification =>
                    this.isValidWildcard(notification, options?.wildcard) && this.isForUser(notification, options)
            )
            .value();
    }

    private isValidWildcard(notification: Notification, wildcardOptions: Maybe<NotificationWildcardType[]>): boolean {
        return (
            !notification.recipients.wildcard ||
            !wildcardOptions ||
            [NotificationWildcard.ALL, ...(wildcardOptions || [])].includes(notification.recipients.wildcard)
        );
    }

    private isForUser(notification: Notification, options?: NotificationListOptions): boolean {
        if (!options?.user) return true; // If no user filter is provided, return true

        const isForUser = notification.recipients.users.some(({ id }) => id === options.user.id);
        const isForGroup = notification.recipients.userGroups.some(({ id }) =>
            options.user.userGroups.some(group => id === group.id)
        );
        const notifForUser = isForUser || isForGroup;

        if (typeof options?.isRead === "boolean") {
            const isRead = notification.readBy.some(({ id }) => id === options.user.id);
            return notifForUser && options?.isRead === isRead;
        }
        return notifForUser;
    }

    private updateNotifications(
        existingNotifications: Notification[],
        notificationUpdates: Partial<Notification>[]
    ): Notification[] {
        const notificationMap = _.keyBy(notificationUpdates, "id");
        return _(existingNotifications)
            .filter(notification => !!notificationMap[notification.id])
            .map(notification => {
                const updatedNotification = notificationMap[notification.id];
                return {
                    ...notification,
                    ...updatedNotification,
                    readBy: _.uniqBy(
                        [...(updatedNotification?.readBy || []), ...(notification.readBy || [])],
                        ({ id }) => id
                    ),
                };
            })
            .value();
    }
}
