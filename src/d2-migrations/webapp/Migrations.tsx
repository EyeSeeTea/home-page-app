import React from "react";

export const Migrations: React.FC = React.memo(props => {
    const { state } = useMigrations();
    if (state === "checking") return null;
    else if (state === "pending") return <div>Migration in progress...</div>;
    return <>{props.children}</>;
});

function useMigrations() {
    const [state, setState] = React.useState<MigrationsState>("checking");

    return {
        state,
    };
}

type MigrationsState = "checking" | "pending" | "completed";
