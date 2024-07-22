import { Debug, Migration, MigrationsStorage } from "../../d2-migrations";
import { fromPromise } from "../../data/api-futures";
import { PersistedLandingNode } from "../../data/entities/PersistedLandingNode";
import { Future, FutureData } from "../../domain/types/Future";

class AllowMultipleLandingPagesMigration {
    constructor(private storage: MigrationsStorage, private debug: Debug) {}

    execute(): FutureData<void> {
        const { storage, debug } = this;

        debug("Getting landing pages");
        const landingPages$ = fromPromise(storage.get<PersistedLandingNode[]>("landing-pages", []));

        return landingPages$.flatMap(pages => {
            debug("Checking if landing trees already exist");
            if (pages.length === 0 || pages[0] instanceof Array) {
                return Future.success(undefined);
            } else {
                debug("Saving previous nodes as array of landing trees");
                return fromPromise(storage.save("landing-pages", [pages]));
            }
        });
    }
}

const migration: Migration = {
    name: "Allow multiple landing pages",
    migrate: async (storage: MigrationsStorage, debug: Debug) =>
        new AllowMultipleLandingPagesMigration(storage, debug).execute().toPromise(),
};

export default migration;
