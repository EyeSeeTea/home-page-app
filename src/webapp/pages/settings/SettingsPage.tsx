import { ConfirmationDialog, ConfirmationDialogProps, useLoading, useSnackbar } from "@eyeseetea/d2-ui-components";
import { Button, FormGroup, Icon, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { NamedRef } from "../../../domain/entities/Ref";
import i18n from "../../../utils/i18n";
import { ComponentParameter } from "../../../types/utils";
import { LandingPageListTable } from "../../components/landing-page-list-table/LandingPageListTable";
import { ActionListTable, buildListActions } from "../../components/action-list-table/ActionListTable";
import { PageHeader } from "../../components/page-header/PageHeader";
import { PermissionsDialog } from "../../components/permissions-dialog/PermissionsDialog";
import { useAppContext } from "../../contexts/app-context";
import { DhisLayout } from "../../components/dhis-layout/DhisLayout";
import { useNavigate } from "react-router-dom";
import { useConfig } from "./useConfig";
import TextFieldOnBlur from "../../components/form/TextFieldOnBlur";
import { CreateButton } from "./CreateButton";
import { InlineInputSave } from "../../components/inline-input-save/InlineInputSave";

export const SettingsPage: React.FC = () => {
    const { actions, landings, reload, compositionRoot, isLoading, isAdmin } = useAppContext();
    const {
        showAllActions,
        updateShowAllActions,
        settingsPermissions,
        updateSettingsPermissions,
        defaultApplication,
        googleAnalyticsCode,
        updateDefaultApplication,
        updateGoogleAnalyticsCode,
        analyticsConfig,
        updateAnalyticsConfig,
    } = useConfig();

    const navigate = useNavigate();
    const snackbar = useSnackbar();
    const loading = useLoading();

    const [permissionsType, setPermissionsType] = useState<string | null>(null);
    const [danglingDocuments, setDanglingDocuments] = useState<NamedRef[]>([]);
    const [application, setDefaultApplication] = useState<string>("");
    const [gaCode, setGaCode] = useState<string>("");
    const [dialogProps, updateDialog] = useState<ConfirmationDialogProps | null>(null);

    const backHome = useCallback(() => {
        navigate("/", { replace: true });
    }, [navigate]);

    const buildSharingDescription = useCallback(() => {
        const users = settingsPermissions?.users?.length ?? 0;
        const userGroups = settingsPermissions?.userGroups?.length ?? 0;

        if (users > 0 && userGroups > 0) {
            return i18n.t("Accessible to {{users}} users and {{userGroups}} user groups", {
                users,
                userGroups,
            });
        } else if (users > 0) {
            return i18n.t("Accessible to {{users}} users", { users });
        } else if (userGroups > 0) {
            return i18n.t("Accessible to {{userGroups}} user groups", { userGroups });
        } else {
            return i18n.t("Only accessible to system administrators");
        }
    }, [settingsPermissions]);

    const cleanUpDanglingDocuments = useCallback(async () => {
        updateDialog({
            title: i18n.t("Clean-up unused documents"),
            description: (
                <ul>
                    {danglingDocuments.map(item => (
                        <li key={item.id}>{`${item.id} ${item.name}`}</li>
                    ))}
                </ul>
            ),
            onCancel: () => updateDialog(null),
            onSave: async () => {
                loading.show(true, i18n.t("Deleting dangling documents"));

                await compositionRoot.instance.deleteDocuments(danglingDocuments.map(({ id }) => id));
                const newDanglingList = await compositionRoot.instance.listDanglingDocuments();
                setDanglingDocuments(newDanglingList);

                snackbar.success(i18n.t("Deleted dangling documents"));
                loading.reset();
                updateDialog(null);
            },
            saveText: i18n.t("Proceed"),
        });
    }, [danglingDocuments, loading, snackbar, compositionRoot]);

    const refreshActions = useCallback(async () => {
        compositionRoot.instance.listDanglingDocuments().then(setDanglingDocuments);
        await reload();
    }, [reload, compositionRoot]);

    const toggleShowAllActions = useCallback(async () => {
        updateShowAllActions(!showAllActions);
    }, [showAllActions, updateShowAllActions]);

    const tableActions: ComponentParameter<typeof ActionListTable, "tableActions"> = useMemo(
        () => ({
            openEditActionPage: ({ id }) => {
                navigate(`/actions/edit/${id}`);
            },
            openCloneActionPage: ({ id }) => {
                navigate(`/actions/clone/${id}`);
            },
            deleteActions: ({ ids }) => compositionRoot.actions.delete(ids),
            swap: ({ from, to }) => compositionRoot.actions.swapOrder(from, to),
            uploadFile: ({ data, name }) => compositionRoot.instance.uploadFile(data, name),
            installApp: ({ id }) => compositionRoot.instance.installApp(id),
        }),
        [compositionRoot, navigate]
    );

    useEffect(() => {
        compositionRoot.instance.listDanglingDocuments().then(setDanglingDocuments);
    }, [compositionRoot]);

    useEffect(() => {
        reload();
    }, [reload]);

    const updateMatomoUrl = React.useCallback(
        (value: string, reload?: boolean) => {
            updateAnalyticsConfig({ codeUrl: value }).then(() => {
                if (reload) {
                    window.location.reload();
                }
            });
        },
        [updateAnalyticsConfig]
    );

    return (
        <DhisLayout>
            {dialogProps && <ConfirmationDialog isOpen={true} maxWidth={"lg"} fullWidth={true} {...dialogProps} />}

            {!!permissionsType && (
                <PermissionsDialog
                    object={{
                        name: "Access to settings",
                        publicAccess: "--------",
                        userAccesses:
                            settingsPermissions?.users?.map(ref => ({
                                ...ref,
                                access: "rw----",
                            })) ?? [],
                        userGroupAccesses:
                            settingsPermissions?.userGroups?.map(ref => ({
                                ...ref,
                                access: "rw----",
                            })) ?? [],
                    }}
                    onChange={updateSettingsPermissions}
                    onClose={() => setPermissionsType(null)}
                />
            )}

            <Header title={i18n.t("Settings")} onBackClick={backHome} />

            <Container>
                <Title>{i18n.t("Permissions")}</Title>

                <Group row={true}>
                    <ListItem button onClick={() => setPermissionsType("settings")}>
                        <ListItemIcon>
                            <Icon>settings</Icon>
                        </ListItemIcon>
                        <ListItemText primary={i18n.t("Access to Settings")} secondary={buildSharingDescription()} />
                    </ListItem>

                    <ListItem button onClick={toggleShowAllActions}>
                        <ListItemIcon>
                            <Icon>{showAllActions ? "visibility" : "visibility_off"}</Icon>
                        </ListItemIcon>
                        <ListItemText
                            primary={i18n.t("Show list with Actions on main landing page")}
                            secondary={
                                showAllActions
                                    ? i18n.t("A list with all the existing Actions is visible")
                                    : i18n.t("The list with all the existing  Actions is hidden")
                            }
                        />
                    </ListItem>

                    {isAdmin && (
                        <ListItem button disabled={danglingDocuments.length === 0} onClick={cleanUpDanglingDocuments}>
                            <ListItemIcon>
                                <Icon>delete_forever</Icon>
                            </ListItemIcon>
                            <ListItemText
                                primary={i18n.t("Clean-up unused documents")}
                                secondary={
                                    danglingDocuments.length === 0
                                        ? i18n.t("There are no unused documents to clean")
                                        : i18n.t("There are {{total}} documents available to clean", {
                                              total: danglingDocuments.length,
                                          })
                                }
                            />
                        </ListItem>
                    )}

                    {isAdmin && (
                        <div>
                            <SubContainer>
                                <h4>{i18n.t("Default application")}</h4>
                                <GridForm>
                                    <TextFieldOnBlur
                                        fullWidth={true}
                                        label={i18n.t("DHIS2 application")}
                                        value={defaultApplication}
                                        onChange={event => setDefaultApplication(event.target.value)}
                                        placeholder={"/dhis-web-dashboard/index.html"}
                                    />
                                    <Button
                                        onClick={() => updateDefaultApplication(application)}
                                        color="primary"
                                        variant="contained"
                                    >
                                        {i18n.t("Save")}
                                    </Button>
                                </GridForm>
                            </SubContainer>
                            <SubContainer>
                                <h4>{i18n.t("Google Analytics 4")}</h4>
                                <GridForm>
                                    <TextFieldOnBlur
                                        fullWidth={true}
                                        label={i18n.t("GA4 Code")}
                                        value={googleAnalyticsCode ?? ""}
                                        onChange={event => setGaCode(event.target.value)}
                                        placeholder={"G-XXXXXXX"}
                                    />
                                    <Button
                                        onClick={() => {
                                            updateGoogleAnalyticsCode(gaCode).then(() => window.location.reload()); // Force reload in order to remove previous GA code initiated script
                                        }}
                                        color="primary"
                                        variant="contained"
                                    >
                                        {i18n.t("Save")}
                                    </Button>
                                </GridForm>
                            </SubContainer>
                            <InlineInputSave
                                title={i18n.t("Matomo Container Tag URL")}
                                label={i18n.t("Url")}
                                value={analyticsConfig?.codeUrl ?? ""}
                                onChange={updateMatomoUrl}
                                onUpdate={value => updateMatomoUrl(value, true)}
                                placeholder="https://cdn.matomo.cloud/{{website}}/{{container_xxxxxx.js}}"
                                saveText={i18n.t("Save")}
                            />
                        </div>
                    )}
                </Group>

                <Title>{i18n.t("Landing pages")}</Title>

                <LandingPageListTable nodes={landings ?? []} isLoading={isLoading} />

                <Title>{i18n.t("Actions")}</Title>

                <ActionListTable
                    rows={buildListActions(actions)}
                    refreshRows={refreshActions}
                    tableActions={tableActions}
                    onActionButtonClick={undefined}
                    isLoading={isLoading}
                />

                <CreateButton landings={landings} />
            </Container>
        </DhisLayout>
    );
};

const Title = styled.h3`
    margin-top: 25px;
`;

const Group = styled(FormGroup)`
    margin-bottom: 35px;
    margin-left: 0;
`;

const Container = styled.div`
    margin: 1.5rem;
`;

export const SubContainer = styled.div`
    margin-bottom: 2rem;
`;

const Header = styled(PageHeader)`
    margin-top: 1rem;
`;

export const GridForm = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;
`;
