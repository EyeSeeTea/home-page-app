import _ from "lodash";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import FileType from "file-type/browser";
import Resizer from "react-image-file-resizer";
import { InstalledApp } from "../../domain/entities/InstalledApp";
import { NamedRef } from "../../domain/entities/Ref";
import { InstanceRepository, UploadFileOptions } from "../../domain/repositories/InstanceRepository";
import { D2Api } from "../../types/d2-api";
import { cache } from "../../utils/cache";
import { getUrls } from "../../utils/urls";
import { DataStoreStorageClient } from "../clients/storage/DataStoreStorageClient";
import { Namespaces } from "../clients/storage/Namespaces";
import { StorageClient } from "../clients/storage/StorageClient";
import { Instance } from "../entities/Instance";
import { UserSearch } from "../entities/SearchUser";
import { getD2APiFromInstance, getVersion } from "../utils/d2-api";
import { getUid, extractUids } from "../utils/uid";

const documentNamePrefix = "[Home Page App]";

export class InstanceDhisRepository implements InstanceRepository {
    private api: D2Api;
    private storageClient: StorageClient;

    constructor(instance: Instance) {
        this.api = getD2APiFromInstance(instance);
        this.storageClient = new DataStoreStorageClient({ type: "global", instance: instance });
    }

    public getBaseUrl(): string {
        return this.api.baseUrl;
    }

    @cache()
    public async getVersion(): Promise<string> {
        return getVersion(this.api);
    }

    public async uploadFile(data: ArrayBuffer, options: UploadFileOptions = {}): Promise<string> {
        const type = await FileType.fromBuffer(data);
        const { mime = "application/unknown", ext } = type ?? {};
        const blob = new Blob([data], { type: mime });
        const name = options.name ?? `Uploaded file${ext ? `.${ext}` : ""}`;

        const { id } = await this.api.files
            .upload({
                id: options.id ?? getUid(await arrayBufferToString(data)),
                name: `${documentNamePrefix} ${name}`,
                data: await transformFile(blob, mime),
            })
            .getData();

        return `../../documents/${id}/data`;
    }

    public async installApp(appName: string): Promise<boolean> {
        const storeApps = await this.listStoreApps();
        const { versions = [] } = storeApps.find(({ name }) => name === appName) ?? {};
        const latestVersion = versions[0]?.id;
        if (!latestVersion) return false;

        try {
            await this.api.appHub.install(latestVersion).getData();
        } catch (error: any) {
            return false;
        }

        return true;
    }

    public async listDanglingDocuments(): Promise<NamedRef[]> {
        const { objects: allFiles } = await this.api.models.documents
            .get({
                filter: { name: { $like: documentNamePrefix } },
                fields: { id: true, name: true },
                paging: false,
            })
            .getData();

        const actions = (await this.storageClient.getObject(Namespaces.ACTIONS)) || [];
        const landings = (await this.storageClient.getObject(Namespaces.LANDING_PAGES)) || [];

        const allUids = allFiles.map(({ id }) => id);
        const validUids = _.flatten([...getUrls(actions), ...getUrls(landings)].map(url => extractUids(url)));

        return _(allUids)
            .difference(validUids)
            .map(id => allFiles.find(file => file.id === id))
            .compact()
            .value();
    }

    public async deleteDocuments(ids: string[]): Promise<void> {
        await this.api.metadata.post({ documents: ids.map(id => ({ id })) }, { importStrategy: "DELETE" }).getData();
    }

    public async searchUsers(query: string): Promise<UserSearch> {
        const options = {
            fields: { id: true, displayName: true },
            filter: { displayName: { ilike: query } },
        };

        return this.api.metadata.get({ users: options, userGroups: options }).getData();
    }

    @cache()
    public async listInstalledApps(): Promise<InstalledApp[]> {
        const apps = await this.api.get<DhisInstalledApp[]>("/apps").getData();

        return apps.map(app => ({
            name: app.name,
            version: app.name,
            fullLaunchUrl: app.launchUrl,
            launchUrl: app.launchUrl.replace(this.api.baseUrl, ""),
        }));
    }

    private async listStoreApps() {
        try {
            return this.api.appHub.list().getData();
        } catch (error: any) {
            console.error(error);
            return [];
        }
    }
}

async function transformFile(blob: Blob, mime: string): Promise<Blob> {
    if (["image/jpeg", "image/png"].includes(mime)) {
        return new Promise(resolve => {
            Resizer.imageFileResizer(blob, 600, 600, "PNG", 100, 0, blob => resolve(blob as Blob), "blob");
        });
    } else if (process.env.NODE_ENV === "development" && mime === "image/gif") {
        try {
            const ffmpeg = createFFmpeg({ corePath: "https://unpkg.com/@ffmpeg/core@0.12.6" });

            await ffmpeg.load();
            ffmpeg.FS("writeFile", "file.gif", await fetchFile(blob));
            await ffmpeg.run(
                "-i",
                "file.gif",
                "-movflags",
                "faststart",
                "-pix_fmt",
                "yuv420p",
                "-vf",
                "scale=trunc(iw/2)*2:trunc(ih/2)*2",
                "file.mp4"
            );

            const data = ffmpeg.FS("readFile", "file.mp4");
            return new Blob([data.buffer], { type: "video/mp4" });
        } catch (error: any) {
            console.error(error);
            return blob;
        }
    }

    return blob;
}

function arrayBufferToString(buffer: ArrayBuffer, encoding = "UTF-8"): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const blob = new Blob([buffer], { type: "text/plain" });
        const reader = new FileReader();

        reader.onload = ev => {
            if (ev.target) {
                resolve(ev.target.result as string);
            } else {
                reject(new Error("Could not convert array to string!"));
            }
        };

        reader.readAsText(blob, encoding);
    });
}

interface DhisInstalledApp {
    version: string;
    name: string;
    appType: "APP" | "RESOURCE" | "DASHBOARD_WIDGET" | "TRACKER_DASHBOARD_WIDGET";
    appStorageSource: string;
    folderName: string;
    icons: Record<string, string>;
    developer: Record<string, string>;
    activities: Record<string, unknown>;
    launchUrl: string;
    appState: string;
    key: string;
    launch_path: string;
    default_locale: string;
}
