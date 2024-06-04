import _ from "lodash";
import { promiseMap, zeroPad } from "../../utils";
import { MigrationsStorage } from "../repositories/MigrationsStorage";
import { Config, Debug, MigrationWithVersion, RunnerOptions } from "../entities/Migration";

const configKey = "migrations";

export class RunMigrations {
    lastMigrationVersion: number;
    private migrations: MigrationWithVersion[];
    private debug: Debug;
    private backupPrefix = "backup-";

    constructor(private storage: MigrationsStorage, private config: Config, private options: RunnerOptions) {
        const { debug = _.identity, migrations } = options;
        this.lastMigrationVersion = _.max(migrations.map(info => info.version)) || 0;
        this.debug = debug;
        this.migrations = this.getMigrationToApply(migrations, config);
        this.storage = storage;
    }

    public async execute(): Promise<void> {
        // Re-load the runner to make sure we have the latest data as config.
        const runner = await RunMigrations.init(this.options);
        return runner.migrateFromCurrent();
    }

    public hasPendingMigrations(): boolean {
        return this.config.version !== this.lastMigrationVersion;
    }

    public get currentStorageVersion(): number {
        return this.config.version;
    }

    setDebug(debug: Debug) {
        const newOptions = { ...this.options, debug };
        return new RunMigrations(this.storage, this.config, newOptions);
    }

    public async runMigrations(migrations: MigrationWithVersion[]): Promise<Config> {
        const { debug, config } = this;

        const configWithCurrentMigration: Config = {
            ...config,
            migration: { version: this.lastMigrationVersion },
        };
        await this.storage.save(configKey, configWithCurrentMigration);

        await this.storage.hasPermission(debug);

        for (const migration of migrations) {
            debug(`Apply migration ${zeroPad(migration.version, 2)} - ${migration.name}`);
            try {
                await migration.migrate(this.storage, debug);
            } catch (error) {
                const errorMsg = `${migration.name}: ${error}`;
                await this.saveConfig({ errorMsg });
                throw error;
            }
        }

        const newConfig = { version: this.lastMigrationVersion };
        await this.storage.save(configKey, newConfig);
        return newConfig;
    }

    static async init(options: RunnerOptions): Promise<RunMigrations> {
        const { storage } = options;
        const config = await storage.get<Config>(configKey, {
            version: 0,
        });
        return new RunMigrations(storage, config, options);
    }

    private async migrateFromCurrent(): Promise<void> {
        const { config, migrations, debug } = this;

        if (_.isEmpty(migrations)) {
            debug(`No migrations pending to run (current version: ${config.version})`);
            return;
        }

        debug(`Migrate: version ${this.currentStorageVersion} to version ${this.lastMigrationVersion}`);

        await this.runMigrations(migrations);
    }

    // dataStore backup methods are currently unused, call only if a migration needs it.

    private async deleteBackup() {
        try {
            const { debug } = this;
            const backupKeys = await this.getBackupKeys();
            debug(`Delete backup entries`);

            await promiseMap(backupKeys, async backupKey => {
                await this.storage.delete(backupKey);
            });
        } catch (err) {
            this.debug(`Error deleting backup (non-fatal)`);
        }
    }

    private async rollBackExistingBackup() {
        if (this.config.migration) {
            await this.rollbackDataStore(new Error("Rollback existing backup"));
        }
    }

    private async backupDataStore() {
        const { debug } = this;
        debug(`Backup data store`);
        const allKeys = await this.storage.getKeys();
        const keysToBackup = _(allKeys)
            .reject(key => key.startsWith(this.backupPrefix))
            .difference([configKey])
            .compact()
            .value();

        await promiseMap(keysToBackup, async key => {
            const value = await this.storage.get(key, {});
            const backupKey = this.backupPrefix + key;
            await this.storage.save(backupKey, value);
        });
    }

    private async getBackupKeys() {
        const allKeys = await this.storage.getKeys();
        return allKeys.filter(key => key.startsWith(this.backupPrefix));
    }

    private async rollbackDataStore(error: Error): Promise<Config> {
        const { debug, config } = this;
        const errorMsg = error.message || error.toString();
        const keysToRestore = await this.getBackupKeys();

        if (_.isEmpty(keysToRestore)) return config;

        debug(`Error: ${errorMsg}`);
        debug("Start rollback");

        await promiseMap(keysToRestore, async backupKey => {
            const value = await this.storage.get(backupKey, {});
            const key = backupKey.replace(/^backup-/, "");
            await this.storage.save(key, value);
            await this.storage.delete(backupKey);
        });

        return this.saveConfig({ errorMsg });
    }

    private async saveConfig(options: { errorMsg?: string } = {}) {
        const { errorMsg } = options;
        const newConfig: Config = {
            ...this.config,
            migration: { version: this.lastMigrationVersion, error: errorMsg },
        };
        await this.storage.save(configKey, newConfig);
        return newConfig;
    }

    private getMigrationToApply(allMigrations: MigrationWithVersion[], config: Config) {
        return _(allMigrations)
            .filter(info => info.version > config.version)
            .sortBy(info => info.version)
            .value();
    }
}
