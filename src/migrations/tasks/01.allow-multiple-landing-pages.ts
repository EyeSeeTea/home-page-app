import { Debug, Migration, MigrationsStorage } from "../../d2-migrations";
import { Future, FutureData } from "../../domain/types/Future";

class EmptyMigration {
    constructor(private storage: MigrationsStorage, private debug: Debug) {}

    execute(): FutureData<void> {
        this.storage.get("landing-pages", []);
        return Future.success(undefined);
    }
}

const migration: Migration = {
    name: "Empty Migration",
    migrate: async (storage: MigrationsStorage, debug: Debug) =>
        new EmptyMigration(storage, debug).execute().toPromise(),
};

export default migration;
