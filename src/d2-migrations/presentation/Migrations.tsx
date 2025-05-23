import React from "react";
import styled from "styled-components";
import i18n from "../../utils/i18n";
import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import { MigrationsStorage } from "../domain/repositories/MigrationsStorage";
import { MigrationTasks } from "../domain/entities/Migration";
import { RunMigrations } from "../domain/usecases/RunMigrations";
import { useMigrations } from "./useMigrations";
import { CircularProgress } from "@material-ui/core";

const isDebug = process.env.NODE_ENV === "development";

export interface MigrationsProps {
    storage: MigrationsStorage;
    tasks: MigrationTasks;
}

export const Migrations: React.FC<MigrationsProps> = React.memo(props => {
    const { state, onFinish } = useMigrations(props.storage, props.tasks);

    if (state.type === "checking") return <LoadingMigrations />;
    // if (state.type === "checking") return props.storage.hasPermission(console.debug) ? <LoadingMigrations /> : null;
    else if (state.type === "pending") return <MigrationsDialog runner={state.runner} onFinish={onFinish} />;
    return <>{props.children}</>;
});

export interface MigrationsRunnerProps {
    runner: RunMigrations;
    onFinish: () => void;
}

const MigrationsDialog: React.FC<MigrationsRunnerProps> = props => {
    const { runner, onFinish } = props;
    const [messages, setMessages] = React.useState<string[]>([]);

    const [state, setState] = React.useState<DialogState>(getInitialState(runner));
    React.useEffect(followContents, [messages]);

    const debug = React.useCallback((message: string) => {
        setMessages(messages => [...messages, message]);
    }, []);

    const startMigration = React.useCallback(() => {
        runMigrations(runner, debug, setState).then(setState);
    }, [runner, debug]);

    const actionText = getActionText(state);

    if (state.type === "app-out-of-date") {
        return <MigrationsError runner={runner} onFinish={onFinish} />;
    }

    return (
        <ConfirmationDialog
            isOpen={true}
            title={i18n.t("There are pending migrations")}
            onSave={() => (state.type === "success" ? onFinish() : startMigration())}
            saveText={actionText}
            onCancel={undefined}
            disableSave={state.type === "migrating" || !actionText}
            maxWidth="md"
            fullWidth={true}
        >
            <div id="migrations-contents">
                <p>{getPendingMigrationsText(runner)}</p>

                <p>
                    {messages.map((msg, idx) => (
                        <React.Fragment key={idx}>
                            {msg}
                            <br />
                        </React.Fragment>
                    ))}
                </p>

                <p>
                    {state.type === "success" &&
                        i18n.t("Migrations finished successfully, you may now continue to the app")}
                </p>
            </div>
        </ConfirmationDialog>
    );
};

const LoadingMigrations: React.FC = () => (
    <ProgressContainer>
        <CircularProgress size={65} />
    </ProgressContainer>
);

const MigrationsError: React.FC<{ runner: RunMigrations; onFinish: () => void }> = ({ runner, onFinish }) => (
    <ConfirmationDialog
        isOpen={true}
        title={i18n.t("Error")}
        onSave={isDebug ? onFinish : undefined}
        saveText={i18n.t("Continue to the app anyway")}
        maxWidth="md"
        fullWidth={true}
    >
        {i18n.t(
            "The database version ({{currentStorageVersion}}) is greater than the app version ({{lastMigrationVersion}}), cannot continue. Please contact the administrator to update the app.",
            runner
        )}
    </ConfirmationDialog>
);

function runMigrations(
    runner: RunMigrations,
    debug: (message: string) => void,
    setState: React.Dispatch<React.SetStateAction<DialogState>>
): Promise<DialogState> {
    setState({ type: "migrating" });

    return runner
        .setDebug(debug)
        .execute()
        .then(() => ({ type: "success" as const }))
        .catch(err => {
            debug("---");
            debug(`Error: ${err.message}`);
            debug(
                i18n.t(
                    "There has been an error. You can either retry or contact your administrator if you think there has been an un recoverable error"
                )
            );
            return { type: "show-info" as const };
        });
}

function followContents() {
    const contentsEl = document.getElementById("migrations-contents");
    const divEl = contentsEl ? contentsEl.parentElement : null;
    if (divEl) divEl.scrollTop = divEl.scrollHeight;
}

function getActionText(state: DialogState): string | undefined {
    switch (state.type) {
        case "show-info":
            return i18n.t("Migrate instance");
        case "migrating":
            return i18n.t("Migrating...");
        case "success":
            return i18n.t("Continue to the App");
        case "app-out-of-date":
            return;
    }
}

function getInitialState(runner: RunMigrations): DialogState {
    if (runner.currentStorageVersion === runner.lastMigrationVersion) {
        return { type: "success" };
    } else if (runner.currentStorageVersion > runner.lastMigrationVersion) {
        return { type: "app-out-of-date" };
    } else {
        return { type: "show-info" };
    }
}

function getPendingMigrationsText(runner: RunMigrations): string {
    return i18n.t(
        "The app needs to run pending migrations (from version {{currentStorageVersion}} to version {{lastMigrationVersion}}) in order to continue. This may take a long time, make sure the process is not interrupted.",
        runner
    );
}

type DialogState = { type: "show-info" } | { type: "app-out-of-date" } | { type: "migrating" } | { type: "success" };

const ProgressContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 80vh;
`;
