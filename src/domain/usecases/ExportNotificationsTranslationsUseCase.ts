import _ from "lodash";
import { NotificationRepository } from "../repositories/NotificationRepository";
import { UseCase } from "./UseCase";
import JSZip from "jszip";
import FileSaver from "file-saver";
import { extractNotificationTranslations } from "./helpers/TranslationService";
import { Future, FutureData } from "../types/Future";
import { fromPromise } from "../../data/api-futures";
import { Notification } from "../entities/Notification";

export class ExportNotificationsTranslationsUseCase implements UseCase {
    constructor(private notificationRepository: NotificationRepository) {}

    public execute(ids: string[]): FutureData<void> {
        return this.fetchAndValidateNotifications(ids).flatMap(this.exportTranslations);
    }

    private fetchAndValidateNotifications(ids: string[]): FutureData<Notification[]> {
        return this.notificationRepository.list({ ids }).flatMap(notifications => {
            if (notifications.length === 0) {
                return Future.error("No notifications to export");
            }
            return Future.success(notifications);
        });
    }

    private exportTranslations = (notifications: Notification[]): FutureData<void> => {
        const translations = extractNotificationTranslations(notifications);
        const files = _.toPairs(translations);
        const zip = new JSZip();

        for (const [lang, contents] of files) {
            const json = JSON.stringify(contents, null, 4);
            const blob = new Blob([json], { type: "application/json" });
            zip.file(`${lang}.json`, blob);
        }

        return fromPromise(zip.generateAsync({ type: "blob" })).map(blob =>
            FileSaver.saveAs(blob, `translations-notifications.zip`)
        );
    };
}
