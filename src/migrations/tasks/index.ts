import { MigrationTasks, migration } from "../../d2-migrations";

export async function getMigrationTasks(): Promise<MigrationTasks> {
    return [
        migration(1, (await import("./01.allow-multiple-landing-pages")).default),
        migration(2, (await import("./02.remove-duplicated-nodes")).default),
    ];
}
