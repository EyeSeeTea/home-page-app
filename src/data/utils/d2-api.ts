import _ from "lodash";
import { D2Api } from "../../types/d2-api";
import { Instance } from "../entities/Instance";
import { InstalledApp } from "../../domain/entities/InstalledApp";

export function getMajorVersion(version: string): number {
    const apiVersion = _.get(version.split("."), 1);
    if (!apiVersion) throw new Error(`Invalid version: ${version}`);
    return Number(apiVersion);
}

export function getD2APiFromInstance(instance: Instance): D2Api {
    return new D2Api({ baseUrl: instance.url, auth: instance.auth, backend: "fetch" });
}

export async function isAppInstalledByUrl(
    api: D2Api,
    launchPath: string,
    installedApps: InstalledApp[]
): Promise<boolean> {
    const isPathRelative = launchPath.startsWith("/");
    // Normalize by removing trailing /, #, #/, /#
    const normalizePath = (path: string) => path.replace(/[/#]+$/, "");
    const [baseAppPath, _] = launchPath.split("#");
    const normalizedLaunchPath = normalizePath(baseAppPath ?? launchPath);

    const isAppInstalled = installedApps.some(app => {
        if (!app.launchUrl) return false;
        return normalizePath(app.launchUrl).endsWith(normalizedLaunchPath);
    });

    // We need this check to handle DHIS2 apps such as Messages and User settings that exist within the DHIS2 instance but are not listed as installed apps
    if (isPathRelative && !isAppInstalled) {
        try {
            const response = await api.baseConnection.request({ method: "get", url: normalizedLaunchPath }).getData();
            return response !== undefined && response !== null && response !== "";
        } catch (error: any) {
            return false;
        }
    }
    return isAppInstalled;
}

export async function getVersion(api: D2Api): Promise<string> {
    const { version } = await api.system.info.getData();
    return version;
}
