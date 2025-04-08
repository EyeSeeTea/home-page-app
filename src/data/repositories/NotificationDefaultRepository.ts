import _ from "lodash";

import { NotificationListOptions, NotificationRepository } from "../../domain/repositories/NotificationRepository";
import { Future, FutureData } from "../../domain/types/Future";
import { Notification, NotificationWildcard, NotificationWildcardType } from "../../domain/entities/Notification";
import { Instance } from "../entities/Instance";
import { InstanceRepository } from "../../domain/repositories/InstanceRepository";
import { DataStoreStorageClient } from "../clients/storage/DataStoreStorageClient";
import { getD2APiFromInstance } from "../utils/d2-api";
import { Namespaces, notificationsDataStoreNamespace } from "../clients/storage/Namespaces";
import { StorageClient } from "../clients/storage/StorageClient";
import { D2Api } from "../../types/d2-api";
import { Maybe } from "../../types/utils";

export class NotificationDefaultRepository implements NotificationRepository {
    private storageClient: StorageClient;
    private api: D2Api;

    constructor(instance: Instance) {
        this.storageClient = new DataStoreStorageClient("global", instance, notificationsDataStoreNamespace);
        this.api = getD2APiFromInstance(instance);
    }

    public list(options: NotificationListOptions): FutureData<Notification[]> {
        return Future.fromPromise(this.storageClient.listObjectsInCollection<Notification>(Namespaces.NOTIFICATIONS))
            .flatMap(notifications => {
                const filteredNotifications = _(notifications)
                    .filter(
                        notification =>
                            this.isValidWildcard(notification, options?.wildcard) &&
                            this.isForUser(notification, options)
                    )
                    .value();

                return Future.success(filteredNotifications);
            })
            .flatMapError(error => {
                console.error(error);
                return Future.error("An error has occurred fetching notifications");
            });
    }

    public save(notifications: Partial<Notification>[]): FutureData<void> {
        return Future.success(undefined);
    }

    private isValidWildcard(notification: Notification, wildcardOptions: Maybe<NotificationWildcardType[]>): boolean {
        return (
            !!notification.recipients.wildcard ||
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
}
