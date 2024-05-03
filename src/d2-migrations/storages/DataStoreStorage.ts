import { D2Api } from "../types/d2-api";
import { Debug } from "../domain/entities/Migration";
import { MigrationsStorage } from "../domain/entities/MigrationsStorage";

export class DataStoreStorage implements MigrationsStorage {
    constructor(private api: D2Api, private namespace: string) {}

    async get<T extends object>(key: string, defaultValue: T): Promise<T> {
        const dataStore = this.api.dataStore(this.namespace);
        const value = await dataStore.get<T>(key).getData();
        if (!value) await dataStore.save(key, defaultValue).getData();
        return value ?? defaultValue;
    }

    async save(key: string, value: any): Promise<void> {
        const dataStore = this.api.dataStore(this.namespace);
        return dataStore.save(key, value).getData();
    }

    async delete(key: string): Promise<void> {
        try {
            await this.api.delete(`/dataStore/${this.namespace}/${key}`).getData();
        } catch (error0) {
            const error = (error0 as any) || {};
            if (!error.response || error.response.status !== 404) {
                throw error;
            }
        }
    }

    async hasPermission(debug: Debug) {
        debug("Check that current user is superadmin");
        const currentUser = await this.api.currentUser.get({ fields: { authorities: true } }).getData();

        if (!currentUser.authorities.includes("ALL"))
            throw new Error("Only a user with authority ALL can run this migration");
    }

    async getKeys(): Promise<string[]> {
        return this.api.dataStore(this.namespace).getKeys().getData();
    }
}
