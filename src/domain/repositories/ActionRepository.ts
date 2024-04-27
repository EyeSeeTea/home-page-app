import { PersistedAction } from "../../data/entities/PersistedAction";
import { Action } from "../entities/Action";

export interface ActionRepository {
    getAll(): Promise<Action[]>;
    get(actionKey: string): Promise<Action | undefined>;
    getPersistedActions(): Promise<PersistedAction[]>;
    update(action: Pick<Action, "id" | "name"> & Partial<Action>): Promise<void>;
    delete(ids: string[]): Promise<void>;
    swapOrder(id1: string, id2: string): Promise<void>;
    exportTranslations(key: string): Promise<void>;
    importTranslations(key: string, language: string, terms: Record<string, string>): Promise<number>;
    save(items: PersistedAction[]): Promise<PersistedAction[]>;
}
