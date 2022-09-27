import { PersistedLandingNode } from "../../data/entities/PersistedLandingNode";
import { LandingNode } from "../entities/LandingNode";

export interface LandingNodeRepository {
    list(): Promise<LandingNode[]>;
    export(ids: string[]): Promise<void>;
    import(files: File[]): Promise<PersistedLandingNode[]>;
    updateChild(node: LandingNode): Promise<void>;
    removeChilds(ids: string[]): Promise<void>;
    exportTranslations(): Promise<void>;
    importTranslations(language: string, terms: Record<string, string>): Promise<number>;
    swapOrder(node1: LandingNode, node2: LandingNode): Promise<void>;
}
