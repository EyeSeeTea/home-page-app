import { PersistedLandingNode } from "../../data/entities/PersistedLandingNode";
import { Maybe } from "../../types/utils";
import { LandingNode } from "../entities/LandingNode";

export interface LandingNodeRepository {
    getById(id: string): Promise<Maybe<LandingNode>>;
    getAll(): Promise<LandingNode[]>;
    export(ids: string[]): Promise<void>;
    import(items: PersistedLandingNode[]): Promise<PersistedLandingNode[]>;
    create(node: LandingNode): Promise<void>;
    updateChild(node: LandingNode): Promise<void>;
    removeChilds(ids: string[]): Promise<void>;
    exportTranslations(ids: string[]): Promise<void>;
    importTranslations(language: string, terms: Record<string, string>, key: string): Promise<number>;
    swapOrder(node1: LandingNode, node2: LandingNode): Promise<void>;
}
