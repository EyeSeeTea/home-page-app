import { NotificationConfigRepository } from "../../domain/repositories/NotificationConfigRepository";
import { Future, FutureData } from "../../domain/types/Future";
import { NotificationConfig } from "../../domain/entities/NotificationConfig";
import { Instance } from "../entities/Instance";
import { DataStoreStorageClient } from "../clients/storage/DataStoreStorageClient";
import { notificationNamespaceKeys, notificationsNamespace } from "../clients/storage/Namespaces";
import { StorageClient } from "../clients/storage/StorageClient";
import i18n from "../../utils/i18n";

export class NotificationConfigDefaultRepository implements NotificationConfigRepository {
    private storageClient: StorageClient;

    constructor(instance: Instance) {
        this.storageClient = new DataStoreStorageClient({
            type: "global",
            instance: instance,
            namespace: notificationsNamespace,
        });
    }

    public get(): FutureData<NotificationConfig> {
        return this._get();
    }

    public save(config: NotificationConfig): FutureData<void> {
        return this._save(config);
    }

    private _get(): FutureData<NotificationConfig> {
        return Future.fromPromise(this.storageClient.getObject<NotificationConfig>(notificationNamespaceKeys.CONFIG))
            .map(config => ({
                permissions: {
                    ...defaultConfig.permissions,
                    ...config?.permissions,
                },
            }))
            .flatMapError(error => {
                console.error(`Notification (getConfig): ${error}`);
                return Future.error(
                    `${i18n.t("An error has occurred fetching notification config")}\n${String(error)}`
                );
            });
    }

    private _save(config: NotificationConfig): FutureData<void> {
        return Future.fromPromise(
            this.storageClient.saveObject<NotificationConfig>(notificationNamespaceKeys.CONFIG, config)
        ).flatMapError(error => {
            console.error(`Notification (saveConfig): ${error}`);
            return Future.error(`${i18n.t("An error has occurred saving notification config")}\n${String(error)}`);
        });
    }
}

const defaultConfig: NotificationConfig = {
    permissions: {
        users: [],
        userGroups: [],
    },
};
