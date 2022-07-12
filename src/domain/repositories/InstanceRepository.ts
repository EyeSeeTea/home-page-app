import { FutureData } from "../types/Future";
import { UserSearch } from "../../data/entities/SearchUser";
//import { InstalledApp } from "../entities/InstalledApp";
import { NamedRef } from "../entities/Ref";
import { InstalledApp } from "../entities/InstalledApp";

export interface InstanceRepository {
    getBaseUrl(): string;
    uploadFile(file: ArrayBuffer, options?: UploadFileOptions): Promise<string>;
    installApp(appId: string): Promise<boolean>;
    isAppInstalledByUrl(launchUrl: string): Promise<boolean>;
    searchUsers(query: string): Promise<UserSearch>;
    listInstalledApps(): Promise<InstalledApp[]>;
    getVersion(): FutureData<string>;
}

export interface UploadFileOptions {
    id?: string;
    name?: string;
}
