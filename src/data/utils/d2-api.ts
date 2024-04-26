import _ from "lodash";
import { D2Api } from "../../types/d2-api";
import { Instance } from "../entities/Instance";

export function getMajorVersion(version: string): number {
    const apiVersion = _.get(version.split("."), 1);
    if (!apiVersion) throw new Error(`Invalid version: ${version}`);
    return Number(apiVersion);
}

export function getD2APiFromInstance(instance: Instance): D2Api {
    return new D2Api({ baseUrl: instance.url, auth: instance.auth, backend: "fetch" });
}

export async function isAppInstalledByUrl(api: D2Api, launchUrl: string): Promise<boolean> {
    const isUrlRelative = launchUrl.startsWith("/");
    if (!isUrlRelative) return false;

    try {
        await api.baseConnection.request({ method: "get", url: launchUrl }).getData();
    } catch (error: any) {
        return false;
    }

    return true;
}

export async function getVersion(api: D2Api): Promise<string> {
    const { version } = await api.system.info.getData();
    return version;
}
