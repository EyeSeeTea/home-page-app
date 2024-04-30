export interface Storage {
    getCurrentVersion(): Promise<number>;
    get<T extends object>(key: string): Promise<T | undefined>;
    getOrCreate<T extends object>(key: string, defaultValue: T): Promise<T>;
    save<T extends object>(key: string, value: T): Promise<void>;
    remove(key: string): Promise<void>;
    listKeys(): Promise<string[]>;
}
