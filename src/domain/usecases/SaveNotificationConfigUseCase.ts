import { NotificationConfigRepository } from "../repositories/NotificationConfigRepository";
import { FutureData } from "../types/Future";
import { NotificationConfig } from "../entities/NotificationConfig";
import { ShallowPartial } from "../../types/utils";

type NotificationConfigUpdates = ShallowPartial<NotificationConfig>;

export class SaveNotificationConfigUseCase {
    constructor(private notificationConfigRepository: NotificationConfigRepository) {}

    public execute(config: NotificationConfigUpdates): FutureData<void> {
        return this.notificationConfigRepository
            .get()
            .map<NotificationConfig>(currentConfig => ({
                permissions: {
                    ...currentConfig.permissions,
                    ...config.permissions,
                },
            }))
            .flatMap(updatedConfig => this.notificationConfigRepository.save(updatedConfig));
    }
}
