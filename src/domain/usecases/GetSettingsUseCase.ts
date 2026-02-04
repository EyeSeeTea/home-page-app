import { Settings } from "../entities/Settings";
import { SettingsRepository } from "../repositories/SettingsRepository";
import { FutureData } from "../types/Future";

export class GetSettingsUseCase {
    constructor(private settingsRepository: SettingsRepository) {}

    public execute(): FutureData<Settings> {
        return this.settingsRepository.get();
    }
}
