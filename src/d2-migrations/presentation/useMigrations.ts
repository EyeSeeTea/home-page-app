import React from "react";
import { RunMigrations } from "../domain/usecases/RunMigrations";
import { MigrationsStorage } from "../domain/repositories/MigrationsStorage";
import { MigrationTasks } from "../domain/entities/Migration";

export type MigrationsState = { type: "checking" } | { type: "pending"; runner: RunMigrations } | { type: "checked" };

export interface UseMigrationsResult {
    state: MigrationsState;
    onFinish: () => void;
}

export function useMigrations(storage: MigrationsStorage, tasks: MigrationTasks): UseMigrationsResult {
    const [state, setState] = React.useState<MigrationsState>({ type: "checking" });
    const onFinish = React.useCallback(() => setState({ type: "checked" }), [setState]);

    React.useEffect(() => {
        runMigrations(storage, tasks).then(setState);
    }, [storage, tasks]);

    const result = React.useMemo(() => ({ state, onFinish }), [state, onFinish]);

    return result;
}

async function runMigrations(storage: MigrationsStorage, tasks: MigrationTasks): Promise<MigrationsState> {
    const runner = await RunMigrations.init({
        storage: storage,
        debug: console.debug,
        migrations: tasks,
    });

    if (runner.hasPendingMigrations()) {
        return { type: "pending", runner };
    } else {
        return { type: "checked" };
    }
}
