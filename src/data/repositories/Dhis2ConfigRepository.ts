import { Permission } from "../../domain/entities/Permission";
import { ConfigRepository } from "../../domain/repositories/ConfigRepository";
import { D2Api } from "../../types/d2-api";
import { cache } from "../../utils/cache";
import { DataStoreStorageClient } from "../clients/storage/DataStoreStorageClient";
import { Namespaces } from "../clients/storage/Namespaces";
import { StorageClient } from "../clients/storage/StorageClient";
import { Instance } from "../entities/Instance";
import { LandingPagePermission, PersistedConfig } from "../entities/PersistedConfig";
import { getD2APiFromInstance, getMajorVersion } from "../../utils/d2-api";
import { User } from "../../domain/entities/User";

export class Dhis2ConfigRepository implements ConfigRepository {
    private instance: Instance;
    private api: D2Api;
    private storageClient: StorageClient;

    constructor(baseUrl: string) {
        this.instance = new Instance({ url: baseUrl });
        this.api = getD2APiFromInstance(this.instance);
        this.storageClient = new DataStoreStorageClient("global", this.instance);
    }

    @cache()
    public async getUser(): Promise<User> {
        const d2User = await this.api.currentUser
            .get({
                fields: {
                    id: true,
                    displayName: true,
                    userGroups: { id: true, name: true },
                    userCredentials: {
                        username: true,
                        userRoles: { id: true, name: true, authorities: true },
                    },
                    settings: { keyUiLocale: true },
                },
            })
            .getData();

        return {
            id: d2User.id,
            name: d2User.displayName,
            userGroups: d2User.userGroups,
            ...d2User.userCredentials,
        };
    }

    public async getUiLocale(d2User: { settings: { keyUiLocale: string; keyDbLocale: string } }): Promise<string> {
        const version = getMajorVersion(await this.api.getVersion());
        if (version > 30 && d2User.settings.keyUiLocale) {
            return d2User.settings.keyUiLocale;
        }

        const settings = await this.api.get<{ keyUiLocale: string }>("/userSettings").getData();
        return settings.keyUiLocale ?? "en";
    }

    public getInstance(): Instance {
        return this.instance;
    }

    public async getSettingsPermissions(): Promise<Permission> {
        const config = await this.getConfig();
        const { users = [], userGroups = [] } = config.settingsPermissions ?? {};
        return { users, userGroups };
    }

    public async updateSettingsPermissions(update: Partial<Permission>): Promise<void> {
        const config = await this.getConfig();
        const { users = [], userGroups = [] } = config.settingsPermissions ?? {};

        await this.storageClient.saveObject<PersistedConfig>(Namespaces.CONFIG, {
            ...config,
            settingsPermissions: {
                users: update.users ?? users,
                userGroups: update.userGroups ?? userGroups,
            },
        });
    }

    public async getLandingPagePermissions(): Promise<LandingPagePermission[]> {
        const config = await this.getConfig();
        const landingPagesPermissions = config.landingPagePermissions ?? [];

        return landingPagesPermissions;
    }

    public async updateLandingPagePermissions(update: Partial<LandingPagePermission>, id: string): Promise<void> {
        const config = await this.getConfig();
        const landingPagesPermissions = config.landingPagePermissions ?? [];

        const { users = [], userGroups = [] } =
            landingPagesPermissions.find(landingPage => landingPage.id === id) ?? {};
        const updatedLandingPagePermissions = landingPagesPermissions.map(landing => {
            if (landing.id === id) {
                return {
                    id,
                    userGroups: update.userGroups ?? userGroups,
                    users: update.users ?? users,
                };
            }
            return landing;
        });

        await this.storageClient.saveObject<PersistedConfig>(Namespaces.CONFIG, {
            ...config,
            landingPagePermissions: updatedLandingPagePermissions,
        });
    }

    public async getShowAllActions(): Promise<boolean> {
        const { showAllActions = true } = await this.getConfig();
        return showAllActions;
    }

    public async setShowAllActions(showAllActions: boolean): Promise<void> {
        const config = await this.getConfig();

        await this.storageClient.saveObject<PersistedConfig>(Namespaces.CONFIG, {
            ...config,
            showAllActions,
        });
    }

    private async getConfig(): Promise<PersistedConfig> {
        const config = await this.storageClient.getObject<PersistedConfig>(Namespaces.CONFIG);
        return config ?? {};
    }
}
