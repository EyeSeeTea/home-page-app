import _ from "lodash";

import { NotificationListOptions, NotificationRepository } from "../../domain/repositories/NotificationRepository";
import { Future, FutureData } from "../../domain/types/Future";
import { Notification, NotificationWildcard, NotificationWildcardType } from "../../domain/entities/Notification";
import { Instance } from "../entities/Instance";
import { DataStoreStorageClient } from "../clients/storage/DataStoreStorageClient";
import { notificationsDataStore } from "../clients/storage/Namespaces";
import { StorageClient } from "../clients/storage/StorageClient";
import { isBoolean, Maybe } from "../../types/utils";
import i18n from "../../utils/i18n";

export class NotificationDefaultRepository implements NotificationRepository {
    private storageClient: StorageClient;

    constructor(instance: Instance) {
        this.storageClient = new DataStoreStorageClient({
            type: "global",
            instance: instance,
            namespace: notificationsDataStore,
        });
    }

    public list(options: NotificationListOptions): FutureData<Notification[]> {
        return this._get().map(notifications => this.filterNotifications(notifications, options));
    }

    public save(notifications: Notification[]): FutureData<void> {
        return this._save(notifications);
    }

    private _get(): FutureData<Notification[]> {
        return Future.fromPromise(
            this.storageClient.listObjectsInCollection<Notification>(notificationsDataStore)
        ).flatMapError(error => {
            console.error(`Notification (list): ${error}`);
            return Future.error(i18n.t("An error has occurred fetching notifications"));
        });
    }

    private _save(notifications: Notification[]): FutureData<void> {
        return Future.fromPromise(
            this.storageClient.saveObjectsInCollection<Notification>(notificationsDataStore, notifications)
        ).flatMapError(error => {
            console.error(`Notification (save): ${error}`);
            return Future.error(i18n.t("An error has occurred while saving notifications"));
        });
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
            [NotificationWildcard.ALL, ...wildcardOptions].includes(notification.recipients.wildcard)
        );
    }

    private isForUser(notification: Notification, options?: NotificationListOptions): boolean {
        if (!options?.user) return true; // If no user filter is provided, return true

        const isForUser = notification.recipients.users.some(({ id }) => id === options.user.id);
        const isForGroup = notification.recipients.userGroups.some(({ id }) =>
            options.user.userGroups.some(group => id === group.id)
        );
        const notifForUser = isForUser || isForGroup;

        if (isBoolean(options?.isRead)) {
            const isRead = notification.readBy.some(({ id }) => id === options.user.id);
            return notifForUser && options?.isRead === isRead;
        }
        return notifForUser;
    }
}
