import { PersistedAction } from "../../data/entities/PersistedAction";
import { Action } from "../entities/Action";

export interface ActionRepository {
    list(): Promise<Action[]>;
    get(actionKey: string): Promise<Action | undefined>;
    update(action: Pick<Action, "id" | "name"> & Partial<Action>): Promise<void>;
    delete(ids: string[]): Promise<void>;
    swapOrder(id1: string, id2: string): Promise<void>;
    exportTranslations(key: string): Promise<void>;
    importTranslations(key: string, language: string, terms: Record<string, string>): Promise<number>;
    export(ids: string[]): Promise<void>;
    import(files: File[]): Promise<PersistedAction[]>;
}
