import FileSaver from "file-saver";
import JSZip from "jszip";
import _ from "lodash";
import { defaultAction, isValidActionType, Action, defaultTranslatableModel } from "../../domain/entities/Action";
import { TranslatableText } from "../../domain/entities/TranslatableText";
import { validateUserPermission } from "../../domain/entities/User";
import { ActionRepository } from "../../domain/repositories/ActionRepository";
import { swapById } from "../../utils/array";
import { promiseMap } from "../../utils/promises";
import { Namespaces } from "../clients/storage/Namespaces";
import { JSONAction } from "../entities/JSONAction";
import { PersistedAction } from "../entities/PersistedAction";
import { getMajorVersion, getVersion, isAppInstalledByUrl } from "../utils/d2-api";
import { Config } from "../entities/Config";

export class ActionDefaultRepository implements ActionRepository {
    constructor(private config: Config) {}

    public async getAll(): Promise<Action[]> {
        try {
            const dataStoreActions = await this.config.storageClient.listObjectsInCollection<PersistedAction>(
                Namespaces.ACTIONS
            );

            const actions = _.uniqBy(dataStoreActions, "id");

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

    public async getPersistedActions() {
        return (await this.config.storageClient.getObject<PersistedAction[]>(Namespaces.ACTIONS)) ?? [];
    }

    public async get(key: string): Promise<Action | undefined> {
        const actions = await this.getPersistedActions();
        const dataStoreModel = _(actions).find(action => action.id === key);
        if (!dataStoreModel) return undefined;

        const domainModel = await this.buildDomainModel(dataStoreModel);

        return domainModel;
    }

    public async update(model: Pick<Action, "id" | "name"> & Partial<Action>): Promise<void> {
        const newAction = await this.buildPersistedModel({ _version: 1, ...defaultAction, ...model });
        await this.saveDataStore(newAction);
    }

    public async save(items: PersistedAction[]): Promise<PersistedAction[]> {
        await promiseMap(items, action => this.saveDataStore(action, { recreate: true }));

        return items;
    }

    public async delete(ids: string[]): Promise<void> {
        for (const id of ids) {
            await this.config.storageClient.removeObjectInCollection(Namespaces.ACTIONS, id);
        }
    }

    public async swapOrder(id1: string, id2: string): Promise<void> {
        const items = await this.config.storageClient.listObjectsInCollection<PersistedAction>(Namespaces.ACTIONS);

        const newItems = swapById(items, id1, id2);
        await this.config.storageClient.saveObject(Namespaces.ACTIONS, newItems);
    }

    public async exportTranslations(key: string): Promise<void> {
        const model = await this.config.storageClient.getObjectInCollection<PersistedAction>(Namespaces.ACTIONS, key);
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
        const model = await this.config.storageClient.getObjectInCollection<PersistedAction>(Namespaces.ACTIONS, key);
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
        const date = new Date().toISOString();

        await this.config.storageClient.saveObjectInCollection<PersistedAction>(Namespaces.ACTIONS, {
            _version: model._version,
            id: model.id,
            name: model.name,
            description: model.description,
            icon: model.icon,
            iconLocation: model.iconLocation,
            backgroundColor: model.backgroundColor,
            fontColor: model.fontColor,
            textAlignment: model.textAlignment,
            type: model.type,
            disabled: model.disabled,
            dhisVersionRange: model.dhisVersionRange,
            dhisAppKey: model.dhisAppKey,
            dhisLaunchUrl: model.dhisLaunchUrl,
            launchPageId: model.launchPageId,
            dhisAuthorities: model.dhisAuthorities,
            publicAccess: model.publicAccess,
            userAccesses: model.userAccesses,
            userGroupAccesses: model.userGroupAccesses,
            lastUpdatedBy: this.config.currentUser,
            lastUpdated: date,
            user: options?.recreate ? this.config.currentUser : model.user,
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

        return {
            ...rest,
            description: model.description ?? defaultTranslatableModel("description"),
            installed: await isAppInstalledByUrl(this.config.api, model.dhisLaunchUrl),
            editable: validateUserPermission(model, "write", this.config.currentUser),
            compatible: validateDhisVersion(model, await getVersion(this.config.api)),
            created: new Date(created),
            lastUpdated: new Date(lastUpdated),
            type: validType,
        };
    }

    private async buildPersistedModel(model: JSONAction): Promise<PersistedAction> {
        const defaultUser = { id: this.config.currentUser.id, name: this.config.currentUser.name };

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
