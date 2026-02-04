import { setTranslationValue } from "../entities/TranslatableText";
import { NotificationRepository } from "../repositories/NotificationRepository";
import { UseCase } from "./UseCase";
import { Notification } from "../entities/Notification";
import { Future, FutureData } from "../types/Future";

export class ImportNotificationsTranslationsUseCase implements UseCase {
    constructor(private notificationRepository: NotificationRepository) {}

    public execute(language: string, terms: Record<string, string>): FutureData<number> {
        return this.fetchAndValidateNotifications(terms)
            .map(notifications => this.setTranslations(language, terms, notifications))
            .flatMap(notifications => this.saveTranslatedNotifications(notifications));
    }

    private fetchAndValidateNotifications(terms: Record<string, string>): FutureData<Notification[]> {
        const ids: string[] = Object.keys(terms);

        return this.notificationRepository.list({ ids }).flatMap(notifications => {
            if (!notifications || notifications.length === 0) {
                return Future.error("Unable to load notification.");
            }
            return Future.success(notifications);
        });
    }

    private setTranslations(
        language: string,
        terms: Record<string, string>,
        notifications: Notification[]
    ): Notification[] {
        return notifications.map(notification => {
            const content = setTranslationValue({
                item: notification.content,
                language,
                term: terms[notification.content.key],
            });
            return Notification.create({ ...notification, content });
        });
    }

    private saveTranslatedNotifications(notifications: Notification[]): FutureData<number> {
        return this.notificationRepository.save(notifications).map(() => notifications.length);
    }
}
