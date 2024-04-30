import React from "react";
import { Storage } from "../domain/entities/Storage";

export interface MigrationsProps {
    storage: Storage;
}

export const Migrations: React.FC<MigrationsProps> = React.memo(props => {
    const { state } = useMigrations(props.storage);
    if (state === "checking") return null;
    else if (state === "pending") return <div>Migration in progress...</div>;
    return <>{props.children}</>;
});

function useMigrations(storage: Storage) {
    const [state, setState] = React.useState<MigrationsState>("checking");

    const currentStorageVersion = React.useMemo(() => storage.getCurrentVersion(), [storage]);

    return {
        state,
    };
}

type MigrationsState = "checking" | "pending" | "completed";
