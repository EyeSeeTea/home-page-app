import { Settings } from "../../domain/entities/Settings";
import { SettingsRepository } from "../../domain/repositories/SettingsRepository";
import { Future, FutureData } from "../../domain/types/Future";
import i18n from "../../locales";
import { Maybe } from "../../types/utils";
import { DataStoreStorageClient } from "../clients/storage/DataStoreStorageClient";
import { Namespaces } from "../clients/storage/Namespaces";
import { StorageClient } from "../clients/storage/StorageClient";
import { Instance } from "../entities/Instance";
import { PersistedSettings } from "../entities/PersistedSettings";

export class SettingsDatastoreRepository implements SettingsRepository {
    private instance: Instance;
    private storageClient: StorageClient;

    constructor(baseUrl: string) {
        this.instance = new Instance({ url: baseUrl });
        this.storageClient = new DataStoreStorageClient({ type: "global", instance: this.instance });
    }

    public get(): FutureData<Settings> {
        return Future.fromPromise(this.storageClient.getObject<PersistedSettings>(Namespaces.CONFIG))
            .flatMap(settings => Future.success(transformDatastoreSettings(settings)))
            .flatMapError(error => {
                return Future.error(`${i18n.t("Error encountered while fetching settings")}\n${String(error)}`);
            });
    }

    public save(settings: Settings): FutureData<void> {
        return Future.fromPromise(
            this.storageClient.saveObject<PersistedSettings>(Namespaces.CONFIG, settings)
        ).flatMapError(error => {
            console.error(`Notification (save): ${error}`);
            return Future.error(`${i18n.t("Error encountered while saving settings")}\n${String(error)}`);
        });
    }
}

export const emptySettings = Settings.create({
    analyticsConfig: { googleAnalyticsCode: "", matomoUrl: "" },
    defaultApplication: "",
    landingPagePermissions: [],
    settingsPermissions: { users: [], userGroups: [] },
    showAllActions: false,
});

const transformDatastoreSettings = (persistedSettings: Maybe<PersistedSettings>): Settings => {
    if (!persistedSettings) return emptySettings;

    const analyticsConfig = {
        googleAnalyticsCode: persistedSettings.analyticsConfig?.googleAnalyticsCode ?? "",
        matomoUrl: persistedSettings.analyticsConfig?.matomoUrl ?? "",
    };

    return new Settings({
        analyticsConfig: analyticsConfig,
        defaultApplication: persistedSettings.defaultApplication ?? "",
        landingPagePermissions: persistedSettings.landingPagePermissions ?? [],
        settingsPermissions: persistedSettings.settingsPermissions ?? { users: [], userGroups: [] },
        showAllActions: persistedSettings.showAllActions ?? false,
    });
};
