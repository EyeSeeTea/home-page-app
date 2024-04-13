import { PersistedLandingPage } from "../../data/entities/PersistedLandingNode";
import { Maybe } from "../../types/utils";
import { LandingNode } from "../entities/LandingNode";

export interface LandingNodeRepository {
    getById(id: string): Promise<Maybe<LandingNode>>;
    getAll(): Promise<LandingNode[]>;
    getPersistedLandingPages(): Promise<PersistedLandingPage[]>;
    create(node: LandingNode): Promise<void>;
    deleteNodes(ids: string[]): Promise<void>;
    save(landingNodes: PersistedLandingPage[]): Promise<void>;
}
