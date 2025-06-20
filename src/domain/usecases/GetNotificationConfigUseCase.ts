import { NotificationConfigRepository } from "../repositories/NotificationConfigRepository";
import { FutureData } from "../types/Future";
import { NotificationConfig } from "../entities/NotificationConfig";

export class GetNotificationConfigUseCase {
    constructor(private notificationConfigRepository: NotificationConfigRepository) {}

    public execute(): FutureData<NotificationConfig> {
        return this.notificationConfigRepository.get();
    }
}
