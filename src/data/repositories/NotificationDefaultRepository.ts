import _ from "lodash";

import { NotificationListOptions, NotificationRepository } from "../../domain/repositories/NotificationRepository";
import { Future, FutureData } from "../../domain/types/Future";
import {
    Notification,
    NotificationAttrs,
    NotificationWildcard,
    NotificationWildcardType,
} from "../../domain/entities/Notification";
import { Instance } from "../entities/Instance";
import { DataStoreStorageClient } from "../clients/storage/DataStoreStorageClient";
import { notificationNamespaceKeys, notificationsNamespace } from "../clients/storage/Namespaces";
import { StorageClient } from "../clients/storage/StorageClient";
import { Maybe } from "../../types/utils";
import i18n from "../../utils/i18n";
import { Translations } from "../../domain/entities/TranslatableText";

type DataStoreNotification = Omit<NotificationAttrs, "content"> & {
    content: string;
    translations?: Translations;
};

export class NotificationDefaultRepository implements NotificationRepository {
    private storageClient: StorageClient;

    constructor(instance: Instance) {
        this.storageClient = new DataStoreStorageClient({
            type: "global",
            instance: instance,
            namespace: notificationsNamespace,
        });
    }

    public list(options?: NotificationListOptions): FutureData<Notification[]> {
        return this._get().map(notifications => this.filterNotifications(notifications, options));
    }

    public save(notifications: Notification[]): FutureData<void> {
        return this._save(notifications);
    }

    public delete(notifications: Notification[]): FutureData<void> {
        return this._delete(notifications);
    }

    private _get(): FutureData<Notification[]> {
        return Future.fromPromise(
            this.storageClient.listObjectsInCollection<DataStoreNotification>(notificationNamespaceKeys.NOTIFICATIONS)
        )
            .flatMap(notifications =>
                Future.parallel(
                    notifications.map(notification => {
                        return Notification.tryCreate(this.mapDataStoreToNotification(notification));
                    })
                )
            )
            .flatMapError(error => {
                console.error(`Notification (list): ${error}`);
                return Future.error(`${i18n.t("An error has occurred fetching notifications")}\n${String(error)}`);
            });
    }

    private _save(notifications: Notification[]): FutureData<void> {
        return Future.fromPromise(
            this.storageClient.saveObjectsInCollection<DataStoreNotification>(
                notificationNamespaceKeys.NOTIFICATIONS,
                notifications.map(notification => this.mapNotificationToDataStore(notification))
            )
        ).flatMapError(error => {
            console.error(`Notification (save): ${error}`);
            return Future.error(`${i18n.t("An error has occurred while saving notifications")}\n${String(error)}`);
        });
    }

    private _delete(notifications: Notification[]): FutureData<void> {
        return Future.fromPromise(
            this.storageClient.removeObjectsInCollection(
                notificationsNamespace,
                notifications.map(notification => notification.id)
            )
        ).flatMapError(error => {
            console.error(`Notification (remove): ${error}`);
            return Future.error(`${i18n.t("An error has occurred deleting notifications")}\n${String(error)}`);
        });
    }

    private filterNotifications(notifications: Notification[], options?: NotificationListOptions): Notification[] {
        return _(notifications)
            .filter(
                notification =>
                    this.isValidWildcard(notification, options?.wildcard) && this.isInIdList(notification, options?.ids)
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

    private isInIdList(notification: Notification, ids?: string[]): boolean {
        return !ids || ids.length === 0 || ids.includes(notification.id);
    }

    private mapNotificationToDataStore(notification: Notification): DataStoreNotification {
        const { content, ...notifProps } = notification._getAttributes();
        return {
            ...notifProps,
            content: content.referenceValue,
            translations: content.translations || {},
        };
    }

    private mapDataStoreToNotification(notification: DataStoreNotification): NotificationAttrs {
        const { content, translations, ...notifProps } = notification;
        //handling for legacy notifications that may have a string content
        const translatableContent = Notification.generateTranslatableContent(notification.id, content, translations);

        return {
            ...notifProps,
            content: translatableContent,
        };
    }
}
