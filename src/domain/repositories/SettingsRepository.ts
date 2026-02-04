import { Settings } from "../entities/Settings";
import { FutureData } from "../types/Future";

export interface SettingsRepository {
    get(): FutureData<Settings>;
    save(settings: Settings): FutureData<void>;
}
