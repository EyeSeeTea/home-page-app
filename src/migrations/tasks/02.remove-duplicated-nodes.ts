import { Debug, Migration, MigrationsStorage } from "../../d2-migrations";
import { fromPromise } from "../../data/api-futures";
import { PersistedLandingPage } from "../../data/entities/PersistedLandingNode";
import { FutureData } from "../../domain/types/Future";

class RemoveDuplicatedNodesMigration {
    constructor(private storage: MigrationsStorage, private debug: Debug) {}

    execute(): FutureData<void> {
        const { storage, debug } = this;

        debug("Getting landing trees");
        const landingPageTrees$ = fromPromise(storage.get<PersistedLandingPage[]>("landing-pages", []));

        return landingPageTrees$.flatMap(landingTrees => {
            const fixedTrees = landingTrees.map(tree =>
                tree.reduce<PersistedLandingPage>((acc, node) => {
                    const inParentTree =
                        node.parent === "none" ||
                        node.type === "root" ||
                        tree.some(maybeParent => maybeParent.id === node.parent); // To avoid nodes out of place

                    const alreadyExist = acc.some(n => n.id === node.id); // To avoid duplicated nodes
                    if (inParentTree && !alreadyExist) {
                        return [...acc, node];
                    } else {
                        return [...acc];
                    }
                }, [])
            );

            debug("Removing duplicated nodes and children nodes out of place");

            return fromPromise(storage.save("landing-pages", fixedTrees));
        });
    }
}

const migration: Migration = {
    name: "Remove duplicated nodes and children nodes out of place",
    migrate: async (storage: MigrationsStorage, debug: Debug) =>
        new RemoveDuplicatedNodesMigration(storage, debug).execute().toPromise(),
};

export default migration;
