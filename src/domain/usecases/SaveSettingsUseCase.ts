import { Settings } from "../entities/Settings";
import { SettingsRepository } from "../repositories/SettingsRepository";
import { FutureData } from "../types/Future";

export class UpdateSettingsUseCase {
    constructor(private settingsRepository: SettingsRepository) {}

    public execute(settings: Settings): FutureData<void> {
        return this.settingsRepository.save(settings);
    }
}
