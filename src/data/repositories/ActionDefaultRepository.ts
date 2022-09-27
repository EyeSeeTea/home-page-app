import FileSaver from "file-saver";
import JSZip from "jszip";
import _ from "lodash";
import { defaultAction, isValidActionType, Action } from "../../domain/entities/Action";
import { TranslatableText } from "../../domain/entities/TranslatableText";
import { validateUserPermission } from "../../domain/entities/User";
import { ActionRepository } from "../../domain/repositories/ActionRepository";
import { ConfigRepository } from "../../domain/repositories/ConfigRepository";
import { InstanceRepository } from "../../domain/repositories/InstanceRepository";
import { swapById } from "../../utils/array";
import { promiseMap } from "../../utils/promises";
import { ImportExportClient } from "../clients/importExport/ImportExportClient";
import { DataStoreStorageClient } from "../clients/storage/DataStoreStorageClient";
import { Namespaces } from "../clients/storage/Namespaces";
import { StorageClient } from "../clients/storage/StorageClient";
import { JSONAction } from "../entities/JSONAction";
import { PersistedAction } from "../entities/PersistedAction";
import { getMajorVersion } from "../utils/d2-api";

export class ActionDefaultRepository implements ActionRepository {
    private storageClient: StorageClient;
    private importExportClient: ImportExportClient;

    constructor(private config: ConfigRepository, private instanceRepository: InstanceRepository) {
        this.storageClient = new DataStoreStorageClient("global", config.getInstance());
        this.importExportClient = new ImportExportClient(this.instanceRepository, "actions");
    }

    public async list(): Promise<Action[]> {
        try {
            const currentUser = await this.config.getUser();
            const dataStoreActions = await this.storageClient.listObjectsInCollection<PersistedAction>(
                Namespaces.ACTIONS
            );

            const actions = _(dataStoreActions)
                .uniqBy("id")
                .filter(({ dhisAuthorities }) => {
                    const userAuthorities = currentUser.userRoles.flatMap(({ authorities }) => authorities);

                    return _.every(
                        dhisAuthorities,
                        authority => userAuthorities.includes("ALL") || userAuthorities.includes(authority)
                    );
                })
                .filter(model => validateUserPermission(model, "read", currentUser))
                .value();

            return promiseMap(actions, async persistedAction => {
                const model = await this.buildDomainModel(persistedAction);

                return {
                    ...model,
                };
            });
        } catch (error: any) {
            console.error(error);
            return [];
        }
    }

    public async get(key: string): Promise<Action | undefined> {
        const dataStoreModel = await this.storageClient.getObjectInCollection<PersistedAction>(Namespaces.ACTIONS, key);

        if (!dataStoreModel) return undefined;

        const domainModel = await this.buildDomainModel(dataStoreModel);

        return domainModel;
    }

    public async update(model: Pick<Action, "id" | "name"> & Partial<Action>): Promise<void> {
        const newAction = await this.buildPersistedModel({ _version: 1, ...defaultAction, ...model });
        await this.saveDataStore(newAction);
    }

    public async import(files: Blob[]): Promise<PersistedAction[]> {
        const items = await this.importExportClient.import<PersistedAction>(files);
        await promiseMap(items, action => this.saveDataStore(action, { recreate: true }));

        return items;
    }

    public async export(ids: string[]): Promise<void> {
        const actions = await promiseMap(ids, id =>
            this.storageClient.getObjectInCollection<PersistedAction>(Namespaces.ACTIONS, id)
        );

        return this.importExportClient.export(actions);
    }

    public async delete(ids: string[]): Promise<void> {
        for (const id of ids) {
            await this.storageClient.removeObjectInCollection(Namespaces.ACTIONS, id);
        }
    }

    public async swapOrder(id1: string, id2: string): Promise<void> {
        const items = await this.storageClient.listObjectsInCollection<PersistedAction>(Namespaces.ACTIONS);

        const newItems = swapById(items, id1, id2);
        await this.storageClient.saveObject(Namespaces.ACTIONS, newItems);
    }

    public async exportTranslations(key: string): Promise<void> {
        const model = await this.storageClient.getObjectInCollection<PersistedAction>(Namespaces.ACTIONS, key);
        if (!model) throw new Error(`Action ${key} not found`);

        const translations = await this.extractTranslations(model);
        const files = _.toPairs(translations);
        const zip = new JSZip();

        for (const [lang, contents] of files) {
            const json = JSON.stringify(contents, null, 4);
            const blob = new Blob([json], { type: "application/json" });
            zip.file(`${lang}.json`, blob);
        }

        const blob = await zip.generateAsync({ type: "blob" });
        const name = _.kebabCase(model.name.referenceValue);
        FileSaver.saveAs(blob, `translations-${name}.zip`);
    }

    public async importTranslations(key: string, language: string, terms: Record<string, string>): Promise<number> {
        const model = await this.storageClient.getObjectInCollection<PersistedAction>(Namespaces.ACTIONS, key);
        if (!model) throw new Error(`Module ${key} not found`);

        const translate = <T extends TranslatableText>(item: T, language: string, term: string | undefined): T => {
            if (term === undefined) {
                return item;
            } else if (language === "en") {
                return { ...item, referenceValue: term };
            } else {
                return { ...item, translations: { ...item.translations, [language]: term } };
            }
        };

        const translatedModel: PersistedAction = {
            ...model,
            name: translate(model.name, language, terms[model.name.key]),
        };

        await this.saveDataStore(translatedModel);

        const translations = await this.extractTranslations(model);
        return _.intersection(_.keys(translations["en"]), _.keys(terms)).length;
    }

    private async extractTranslations(model: PersistedAction): Promise<Record<string, Record<string, string>>> {
        const texts = _.compact([model.name]);

        const referenceStrings = _.fromPairs(texts.map(({ key, referenceValue }) => [key, referenceValue]));
        const translatedStrings = _(texts)
            .flatMap(({ key, translations }) => _.toPairs(translations).map(([lang, value]) => ({ lang, key, value })))
            .groupBy("lang")
            .mapValues(array => _.fromPairs(array.map(({ key, value }) => [key, value])))
            .value();

        return { ...translatedStrings, en: referenceStrings };
    }

    private async saveDataStore(model: PersistedAction, options?: { recreate?: boolean; revision?: number }) {
        const currentUser = await this.config.getUser();
        const user = { id: currentUser.id, name: currentUser.name };
        const date = new Date().toISOString();

        await this.storageClient.saveObjectInCollection<PersistedAction>(Namespaces.ACTIONS, {
            _version: model._version,
            id: model.id,
            name: model.name,
            icon: model.icon,
            type: model.type,
            disabled: model.disabled,
            dhisVersionRange: model.dhisVersionRange,
            dhisAppKey: model.dhisAppKey,
            dhisLaunchUrl: model.dhisLaunchUrl,
            dhisAuthorities: model.dhisAuthorities,
            publicAccess: model.publicAccess,
            userAccesses: model.userAccesses,
            userGroupAccesses: model.userGroupAccesses,
            lastUpdatedBy: user,
            lastUpdated: date,
            user: options?.recreate ? user : model.user,
            created: options?.recreate ? date : model.created,
            dirty: !options?.recreate,
        });
    }

    private async buildDomainModel(model: PersistedAction): Promise<Omit<Action, "outdated" | "builtin">> {
        if (model._version !== 1) {
            throw new Error(`Unsupported revision of module: ${model._version}`);
        }

        const { created, lastUpdated, type, ...rest } = model;
        const validType = isValidActionType(type) ? type : "app";
        const currentUser = await this.config.getUser();
        const instanceVersion = await this.instanceRepository.getVersion();

        return {
            ...rest,
            installed: await this.instanceRepository.isAppInstalledByUrl(model.dhisLaunchUrl),
            editable: validateUserPermission(model, "write", currentUser),
            compatible: validateDhisVersion(model, instanceVersion),
            created: new Date(created),
            lastUpdated: new Date(lastUpdated),
            type: validType,
        };
    }

    private async buildPersistedModel(model: JSONAction): Promise<PersistedAction> {
        const currentUser = await this.config.getUser();
        const defaultUser = { id: currentUser.id, name: currentUser.name };

        return {
            created: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            publicAccess: "--------",
            userAccesses: [],
            userGroupAccesses: [],
            user: defaultUser,
            lastUpdatedBy: defaultUser,
            dirty: true,
            ...model,
        };
    }
}

function validateDhisVersion(model: PersistedAction, instanceVersion: string): boolean {
    const actionVersions = _.compact(model.dhisVersionRange.split(","));
    if (actionVersions.length === 0) return true;

    return _.some(actionVersions, version => getMajorVersion(version) === getMajorVersion(instanceVersion));
}
