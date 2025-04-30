import { D2Api, DataStore } from "../../../types/d2-api";
import { Instance } from "../../entities/Instance";
import { getD2APiFromInstance } from "../../utils/d2-api";
import { dataStoreNamespace } from "./Namespaces";
import { StorageClient } from "./StorageClient";

type DataStoreClientProps = {
    type: "user" | "global";
    instance: Instance;
    namespace?: string;
};

export class DataStoreStorageClient extends StorageClient {
    private api: D2Api;
    private dataStore: DataStore;

    constructor({ type, instance, namespace = dataStoreNamespace }: DataStoreClientProps) {
        super();
        this.api = getD2APiFromInstance(instance);
        this.dataStore = type === "user" ? this.api.userDataStore(namespace) : this.api.dataStore(namespace);
    }

    public async getObject<T extends object>(key: string): Promise<T | undefined> {
        const value = await this.dataStore.get<T>(key).getData();
        return value;
    }

    public async getOrCreateObject<T extends object>(key: string, defaultValue: T): Promise<T> {
        const value = await this.getObject<T>(key);
        if (!value) await this.saveObject(key, defaultValue);
        return value ?? defaultValue;
    }

    public async saveObject<T extends object>(key: string, value: T): Promise<void> {
        await this.dataStore.save(key, value).getData();
    }

    public async removeObject(key: string): Promise<void> {
        try {
            await this.dataStore.delete(key).getData();
        } catch (error: any) {
            if (!error.response || error.response.status !== 404) {
                throw error;
            }
        }
    }
}
