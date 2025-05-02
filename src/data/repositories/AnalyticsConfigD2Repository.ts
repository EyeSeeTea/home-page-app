import { AnalyticsConfig } from "../../domain/entities/AnalyticsConfig";
import { AnalyticsConfigRepository } from "../../domain/repositories/AnalyticsConfigRepository";
import { Instance } from "../entities/Instance";
import { StorageClient } from "../clients/storage/StorageClient";
import { DataStoreStorageClient } from "../clients/storage/DataStoreStorageClient";
import { Namespaces } from "../clients/storage/Namespaces";
import { Maybe } from "../../types/utils";

export class AnalyticsConfigD2Repository implements AnalyticsConfigRepository {
    private instance: Instance;
    private storageClient: StorageClient;

    constructor(baseUrl: string) {
        this.instance = new Instance({ url: baseUrl });
        this.storageClient = new DataStoreStorageClient({ instance: this.instance, type: "global" });
    }

    async get(): Promise<AnalyticsConfig> {
        const config = await this.storageClient.getObject<D2AnalyticsConfig>(Namespaces.CONFIG);
        return { codeUrl: config?.matomoUrl };
    }

    async save(config: AnalyticsConfig): Promise<void> {
        const d2Config = await this.storageClient.getObject<D2AnalyticsConfig>(Namespaces.CONFIG);

        await this.storageClient.saveObject<D2AnalyticsConfig>(Namespaces.CONFIG, {
            ...d2Config,
            matomoUrl: config.codeUrl,
        });
    }
}

type D2AnalyticsConfig = { matomoUrl: Maybe<string> };
