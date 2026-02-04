import { NotificationRepository } from "../repositories/NotificationRepository";
import { Future, FutureData } from "../types/Future";
import { Notification } from "../entities/Notification";
import { User } from "../entities/User";
import _ from "lodash";

export class SaveNotificationsUseCase {
    constructor(private notificationRepository: NotificationRepository) {}

    public execute(notifications: Notification[], user: User): FutureData<void> {
        const allErrors = _(notifications)
            .flatMap(notification => {
                const errors = notification.validate({ user });
                return errors.map(err => err.message);
            })
            .uniq()
            .value();

        if (allErrors.length > 0) {
            return Future.error(allErrors.join("\n"));
        }

        // assume user saving the notification has read it
        const updatedNotifs = Notification.readAllNotifications(notifications, user);
        return this.notificationRepository.save(updatedNotifs);
    }
}
