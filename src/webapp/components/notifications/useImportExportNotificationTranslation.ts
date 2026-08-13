import { useAppContext } from "../../contexts/app-context";
import { useCallback } from "react";
import { useLoading, useSnackbar } from "@eyeseetea/d2-ui-components";
import i18n from "../../../utils/i18n";

export function useImportExportNotificationTranslation(fetchNotifications: () => Promise<void>) {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const loading = useLoading();

    const handleTranslationUpload = useCallback(
        async (lang: string, terms: Record<string, string>) => {
            const total = await compositionRoot.notification.importTranslations(lang, terms).toPromise();
            if (total > 0) {
                snackbar.success(i18n.t("Imported translations for {{total}} notification/s", { total }));
            } else {
                snackbar.warning(i18n.t("Unable to import translations"));
            }
            await fetchNotifications();
        },
        [snackbar, compositionRoot.notification, fetchNotifications]
    );

    const exportTranslations = useCallback(
        async (ids: string[]) => {
            loading.show(true, i18n.t("Exporting translations"));
            await compositionRoot.notification.exportTranslations(ids).toPromise();
            loading.reset();
        },
        [loading, compositionRoot.notification]
    );

    return {
        handleTranslationUpload,
        exportTranslations,
    };
}
