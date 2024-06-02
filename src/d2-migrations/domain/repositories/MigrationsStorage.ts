import { Debug } from "../entities/Migration";

export interface MigrationsStorage {
    get<T extends object>(key: string, defaultValue: T): Promise<T>;
    save(key: string, value: any): Promise<void>;
    delete(key: string): Promise<void>;
    hasPermission(debug: Debug): Promise<void>;
    getKeys(): Promise<string[]>;
}
