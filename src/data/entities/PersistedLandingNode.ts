import { LandingNode } from "../../domain/entities/LandingNode";
import { LandingPagePermission } from "../../domain/entities/Permission";

export type PersistedLandingNode = Omit<LandingNode, "children">;
export type PersistedLandingPage = PersistedLandingNode[];

export type PersistedLandingNodeWithPermissions = PersistedLandingNode &
    Partial<{
        sharingSettings: LandingPagePermission;
    }>;
export type PersistedLandingPageWithPermissions = PersistedLandingNodeWithPermissions[];
