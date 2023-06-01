import { NamedRef } from "./Ref";

export interface Permission {
    users?: NamedRef[];
    userGroups?: NamedRef[];
}

export interface LandingPagePermission extends Permission {
    id: string;
    // publicAccess is '--------' | 'r-------'  | 'rw------'
    publicAccess: string;
}
