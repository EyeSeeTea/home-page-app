import { Storage } from "../domain/entities/Storage";

export class DataStoreStorage implements Storage {
    public getCurrentVersion(): Promise<number> {
        // Add your implementation here
        // Retrieve the current storage version from the storage client
        // and return it
        return Promise.resolve(0);
    }

    public async get<T extends object>(key: string): Promise<T | undefined> {
        // Add your implementation here
        // Retrieve the value from the storage client
        // and return it
        return undefined;
    }

    public async getOrCreate<T extends object>(key: string, defaultValue: T): Promise<T> {
        // Add your implementation here
        // Retrieve the value from the storage client
        // and return it
        return defaultValue;
    }

    public async save<T extends object>(key: string, value: T): Promise<void> {
        // Add your implementation here
        // Save the value to the storage client
    }

    public async remove(key: string): Promise<void> {
        // Add your implementation here
        // Remove the value from the storage client
    }

    public async listKeys(): Promise<string[]> {
        // Add your implementation here
        // Retrieve the list of keys from the storage client
        // and return it
        return [];
    }
}
