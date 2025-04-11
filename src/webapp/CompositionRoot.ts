import { Instance } from "../data/entities/Instance";
import { ActionDefaultRepository } from "../data/repositories/ActionDefaultRepository";
import { Dhis2ConfigRepository } from "../data/repositories/Dhis2ConfigRepository";
import { InstanceDhisRepository } from "../data/repositories/InstanceDhisRepository";
import { LandingNodeDefaultRepository } from "../data/repositories/LandingNodeDefaultRepository";
import { UserApiRepository } from "../data/repositories/UserApiRepository";
import { DeleteActionsUseCase } from "../domain/usecases/DeleteActionsUseCase";
import { ExportActionsUseCase } from "../domain/usecases/ExportActionsUseCase";
import { ExportActionTranslationsUseCase } from "../domain/usecases/ExportActionTranslationsUseCase";
import { ImportActionTranslationsUseCase } from "../domain/usecases/ImportActionTranslationsUseCase";
import { GetActionByIdUseCase } from "../domain/usecases/GetActionByIdUseCase";
import { GetCurrentUserUseCase } from "../domain/usecases/GetCurrentUserUseCase";
import { GetInstanceVersionUseCase } from "../domain/usecases/GetInstanceVersionUseCase";
import { ImportActionsUseCase } from "../domain/usecases/ImportActionsUseCase";
import { ListActionsUseCase } from "../domain/usecases/ListActionsUseCase";
import { SwapActionOrderUseCase } from "../domain/usecases/SwapActionOrderUseCase";
import { UpdateActionUseCase } from "../domain/usecases/UpdateActionUseCase";
import { UseCase } from "../domain/usecases/UseCase";
import { ListLandingChildrenUseCase } from "../domain/usecases/ListLandingChildrenUseCase";
import { UpdateLandingNodeUseCase } from "../domain/usecases/UpdateLandingNodeUseCase";
import { DeleteLandingNodesUseCase } from "../domain/usecases/DeleteLandingNodesUseCase";
import { ExportLandingNodesUseCase } from "../domain/usecases/ExportLandingNodesUseCase";
import { ImportLandingNodesUseCase } from "../domain/usecases/ImportLandingNodesUseCase";
import { ExportLandingNodesTranslationsUseCase } from "../domain/usecases/ExportLandingNodesTranslationsUseCase";
import { ImportLandingNodesTranslationsUseCase } from "../domain/usecases/ImportLandingNodesTranslationsUseCase";
import { SwapLandingChildOrderUseCase } from "../domain/usecases/SwapLandingChildOrderUseCase";
import { UpdateSettingsPermissionsUseCase } from "../domain/usecases/UpdateSettingsPermissionsUseCase";
import { SetShowAllActionsUseCase } from "../domain/usecases/SetShowAllActionsUseCase";
import { GetShowAllActionsUseCase } from "../domain/usecases/GetShowAllActionsUseCase";
import { CheckSettingsPermissionsUseCase } from "../domain/usecases/CheckSettingsPermissionsUseCase";
import { CheckAdminAuthorityUseCase } from "../domain/usecases/CheckAdminAuthorityUseCase";
import { UploadFileUseCase } from "../domain/usecases/UploadFileUseCase";
import { InstallAppUseCase } from "../domain/usecases/InstallAppUseCase";
import { SearchUsersUseCase } from "../domain/usecases/SearchUsersUseCase";
import { ListInstalledAppsUseCase } from "../domain/usecases/ListInstalledAppsUseCase";
import { ListDanglingDocumentsUseCase } from "../domain/usecases/ListDanglingDocumentsUseCase";
import { DeleteDocumentsUseCase } from "../domain/usecases/DeleteDocumentsUseCase";
import { GetSettingsPermissionsUseCase } from "../domain/usecases/GetSettingsPermissionsUseCase";
import { GetLandingPagePermissionsUseCase } from "../domain/usecases/GetLandingPagePermissions";
import { UpdateLandingPagePermissionsUseCase } from "../domain/usecases/UpdateLandingPagePermissions";
import { GetUserUseCase } from "../domain/usecases/GetUserUseCase";
import { GetDefaultApplicationUseCase } from "../domain/usecases/GetDefaultApplicationUseCase";
import { UpdateDefaultApplicationUseCase } from "../domain/usecases/UpdateDefaultApplicationUseCase";
import { CreateLandingNodeUseCase } from "../domain/usecases/CreateLandingNodeUseCase";
import { SendPageViewUseCase } from "../domain/usecases/SendPageViewUseCase";
import { GoogleAnalyticsRepository } from "../data/repositories/GoogleAnalyticsRepository";
import { ImportExportClient } from "../data/clients/importExport/ImportExportClient";
import { GetConfigUseCase } from "../domain/usecases/GetConfigUseCase";
import { UpdateGoogleAnalyticsCode } from "../domain/usecases/UpdateGoogleAnalyticsCode";
import { GetGoogleAnalyticsCodeUseCase } from "../domain/usecases/GetGoogleAnalyticsCodeUseCase";
import { ListCurrentUserNotificationsUseCase } from "../domain/usecases/ListCurrentUserNotificationsUseCase";
import { NotificationDefaultRepository } from "../data/repositories/NotificationDefaultRepository";
import { ReadCurrentUserNotificationsUseCase } from "../domain/usecases/ReadCurrentUserNotificationsUseCase";

export async function getCompositionRoot(instance: Instance) {
    const configRepository = new Dhis2ConfigRepository(instance.url);
    const config = await new GetConfigUseCase(configRepository).execute();
    const userRepository = new UserApiRepository(instance);
    const instanceRepository = new InstanceDhisRepository(instance);
    const notificationsRepository = new NotificationDefaultRepository(instance);

    const importExportClientLandings = new ImportExportClient(instanceRepository, "landing-pages");
    const importExportClientActions = new ImportExportClient(instanceRepository, "actions");

    const actionRepository = new ActionDefaultRepository(config);
    const landingPageRepository = new LandingNodeDefaultRepository(config.storageClient);
    const analyticsRepository = new GoogleAnalyticsRepository();

    return {
        actions: getExecute({
            get: new GetActionByIdUseCase(actionRepository),
            list: new ListActionsUseCase(config, actionRepository),
            update: new UpdateActionUseCase(actionRepository, landingPageRepository),
            delete: new DeleteActionsUseCase(actionRepository),
            swapOrder: new SwapActionOrderUseCase(actionRepository),
            export: new ExportActionsUseCase(actionRepository, importExportClientActions),
            import: new ImportActionsUseCase(actionRepository, landingPageRepository, importExportClientActions),
            exportTranslations: new ExportActionTranslationsUseCase(actionRepository),
            importTranslations: new ImportActionTranslationsUseCase(actionRepository),
        }),
        landings: getExecute({
            list: new ListLandingChildrenUseCase(landingPageRepository),
            update: new UpdateLandingNodeUseCase(landingPageRepository),
            create: new CreateLandingNodeUseCase(landingPageRepository),
            delete: new DeleteLandingNodesUseCase(landingPageRepository),
            export: new ExportLandingNodesUseCase(landingPageRepository, importExportClientLandings),
            import: new ImportLandingNodesUseCase(landingPageRepository, importExportClientLandings),
            exportTranslations: new ExportLandingNodesTranslationsUseCase(landingPageRepository),
            importTranslations: new ImportLandingNodesTranslationsUseCase(landingPageRepository),
            swapOrder: new SwapLandingChildOrderUseCase(landingPageRepository),
        }),
        config: getExecute({
            getUser: new GetUserUseCase(configRepository),
            getDefaultApplication: new GetDefaultApplicationUseCase(configRepository),
            updateDefaultApplication: new UpdateDefaultApplicationUseCase(configRepository),
            getGoogleAnalyticsCode: new GetGoogleAnalyticsCodeUseCase(configRepository),
            updateGoogleAnalyticsCode: new UpdateGoogleAnalyticsCode(configRepository),
            getSettingsPermissions: new GetSettingsPermissionsUseCase(configRepository),
            updateSettingsPermissions: new UpdateSettingsPermissionsUseCase(configRepository),
            getLandingPagePermissions: new GetLandingPagePermissionsUseCase(configRepository),
            updateLandingPagePermissions: new UpdateLandingPagePermissionsUseCase(configRepository),
            getShowAllActions: new GetShowAllActionsUseCase(configRepository),
            setShowAllActions: new SetShowAllActionsUseCase(configRepository),
        }),
        instance: getExecute({
            uploadFile: new UploadFileUseCase(instanceRepository),
            installApp: new InstallAppUseCase(instanceRepository, actionRepository),
            searchUsers: new SearchUsersUseCase(instanceRepository),
            listInstalledApps: new ListInstalledAppsUseCase(instanceRepository),
            listDanglingDocuments: new ListDanglingDocumentsUseCase(instanceRepository),
            deleteDocuments: new DeleteDocumentsUseCase(instanceRepository),

            getVersion: new GetInstanceVersionUseCase(instanceRepository),
        }),
        user: getExecute({
            getCurrent: new GetCurrentUserUseCase(userRepository),
            checkSettingsPermissions: new CheckSettingsPermissionsUseCase(configRepository),
            checkAdminAuthority: new CheckAdminAuthorityUseCase(configRepository),
        }),
        analytics: getExecute({
            sendPageView: new SendPageViewUseCase(analyticsRepository, configRepository),
        }),
        notifications: getExecute({
            getUserNotifications: new ListCurrentUserNotificationsUseCase(notificationsRepository, userRepository),
            readUserNotifications: new ReadCurrentUserNotificationsUseCase(notificationsRepository, userRepository),
        }),
    };
}

export type CompositionRoot = Awaited<ReturnType<typeof getCompositionRoot>>;

function getExecute<UseCases extends Record<Key, UseCase>, Key extends keyof UseCases>(
    useCases: UseCases
): { [K in Key]: UseCases[K]["execute"] } {
    const keys = Object.keys(useCases) as Key[];
    const initialOutput = {} as { [K in Key]: UseCases[K]["execute"] };

    return keys.reduce((output, key) => {
        const useCase = useCases[key];
        const execute = useCase.execute.bind(useCase) as UseCases[typeof key]["execute"];
        output[key] = execute;
        return output;
    }, initialOutput);
}
