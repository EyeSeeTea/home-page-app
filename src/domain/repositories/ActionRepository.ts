import { PersistedAction } from "../../data/entities/PersistedAction";
import { Maybe } from "../../types/utils";
import { Action } from "../entities/Action";
import { InstalledApp } from "../entities/InstalledApp";

export interface ActionRepository {
    getAll(installedApps: InstalledApp[]): Promise<Action[]>;
    get(actionKey: string, installedApps: InstalledApp[]): Promise<Maybe<Action>>;
    getPersistedActions(): Promise<PersistedAction[]>;
    update(action: Pick<Action, "id" | "name"> & Partial<Action>): Promise<void>;
    delete(ids: string[]): Promise<void>;
    swapOrder(id1: string, id2: string): Promise<void>;
    exportTranslations(key: string): Promise<void>;
    importTranslations(key: string, language: string, terms: Record<string, string>): Promise<number>;
    save(items: PersistedAction[]): Promise<PersistedAction[]>;
}
