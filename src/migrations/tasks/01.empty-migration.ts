import { Migration } from "../../d2-migrations";
import { Future, FutureData } from "../../domain/types/Future";

class EmptyMigration {
    execute(): FutureData<undefined> {
        return Future.success(undefined);
    }
}

const migration: Migration = {
    name: "Empty Migration",
    migrate: async () => new EmptyMigration().execute().toPromise(),
};

export default migration;
