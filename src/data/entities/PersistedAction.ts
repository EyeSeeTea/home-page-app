import { NamedRef, SharingSetting } from "../../domain/entities/Ref";
import { JSONAction } from "./JSONAction";

export interface PersistedAction extends JSONAction {
    publicAccess: string;
    userAccesses: SharingSetting[];
    userGroupAccesses: SharingSetting[];
    user: NamedRef;
    created: string;
    lastUpdated: string;
    lastUpdatedBy: NamedRef;
    dirty: boolean;
}
