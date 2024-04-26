import { User } from "../../domain/entities/User";
import { D2Api } from "../../types/d2-api";
import { StorageClient } from "../clients/storage/StorageClient";
import { Instance } from "./Instance";

export interface Config {
    api: D2Api;
    currentUser: User;
    instance: Instance;
    storageClient: StorageClient;
}
