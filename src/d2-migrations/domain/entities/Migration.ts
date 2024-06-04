import { MigrationsStorage } from "../repositories/MigrationsStorage";

export interface Config {
    version: number;
    migration?: { version: number; error?: string };
}

export type Debug = (message: string) => void;

export interface MigrationWithVersion {
    version: number;
    migrate: MigrationFn;
    name: string;
}

export type Migration = Omit<MigrationWithVersion, "version">;

export type MigrationFn = (storage: MigrationsStorage, debug: Debug) => Promise<void>;

export interface RunnerOptions {
    storage: MigrationsStorage;
    debug?: Debug;
    migrations: MigrationWithVersion[];
}

export type MigrationTasks = MigrationWithVersion[];

export function migration(version: number, migration: Migration): MigrationWithVersion {
    return { version, ...migration };
}
