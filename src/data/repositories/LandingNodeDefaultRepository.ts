import FileSaver from "file-saver";
import JSZip from "jszip";
import _ from "lodash";
import { LandingNode, LandingNodeModel } from "../../domain/entities/LandingNode";
import { TranslatableText } from "../../domain/entities/TranslatableText";
import { ConfigRepository } from "../../domain/repositories/ConfigRepository";
import { InstanceRepository } from "../../domain/repositories/InstanceRepository";
import { LandingNodeRepository } from "../../domain/repositories/LandingNodeRepository";
import { ImportExportClient } from "../clients/importExport/ImportExportClient";
import { DataStoreStorageClient } from "../clients/storage/DataStoreStorageClient";
import { Namespaces } from "../clients/storage/Namespaces";
import { StorageClient } from "../clients/storage/StorageClient";
import { PersistedLandingNode } from "../entities/PersistedLandingNode";
import { generateUid } from "../utils/uid";

export class LandingNodeDefaultRepository implements LandingNodeRepository {
    private storageClient: StorageClient;
    private importExportClient: ImportExportClient;

    constructor(config: ConfigRepository, instanceRepository: InstanceRepository) {
        this.storageClient = new DataStoreStorageClient("global", config.getInstance());
        this.importExportClient = new ImportExportClient(instanceRepository, "landing-pages");
    }

    public async list(): Promise<LandingNode[]> {
        try {
            const persisted =
                (await this.storageClient.getObject<PersistedLandingNode[][]>(Namespaces.LANDING_PAGES)) ?? [];

            const roots = _.every(persisted, persist => Array.isArray(persist))
                ? _.compact(persisted.map(model => model?.find(({ parent }) => parent === "none")))
                : [];

            const validations = roots.map(root =>
                LandingNodeModel.decode(buildDomainLandingNode(root, _.flatten(persisted)))
            );

            _.forEach(validations, validation => {
                if (validation.isLeft()) {
                    throw new Error(validation.extract());
                }
            });

            if (persisted.length === 0 || roots.length === 0) {
                const root: PersistedLandingNode = {
                    id: generateUid(),
                    parent: "none",
                    type: "root" as const,
                    icon: "img/logo-eyeseetea.png",
                    iconLocation: "top",
                    pageRendering: "multiple",
                    order: undefined,
                    name: {
                        key: "root-name",
                        referenceValue: "Main landing page",
                        translations: {},
                    },
                    title: {
                        key: "root-title",
                        referenceValue: "Welcome to Home Page App",
                        translations: {},
                    },
                    content: undefined,
                    actions: [],
                    backgroundColor: "#276696",
                };

                await this.storageClient.saveObject<PersistedLandingNode[][]>(Namespaces.LANDING_PAGES, [[root]]);
                return [{ ...root, children: [] }];
            }

            return _.flatten(validations.map(validation => _.compact([validation.toMaybe().extract()])));
        } catch (error: any) {
            console.error(error);
            return [];
        }
    }

    public async export(ids: string[]): Promise<void> {
        const nodes = (await this.storageClient.getObject<PersistedLandingNode[][]>(Namespaces.LANDING_PAGES)) ?? [];

        const toExport = nodes.filter(node => node.find(item => ids.includes(item.id)));

        toExport.forEach(node => {
            return this.importExportClient.export(node);
        });
    }

    public async import(files: File[]): Promise<PersistedLandingNode[]> {
        const persisted =
            (await this.storageClient.getObject<PersistedLandingNode[][]>(Namespaces.LANDING_PAGES)) ?? [];
        const items = await this.importExportClient.import<PersistedLandingNode>(files);

        const updatedLandingNodes = updateLandingNode(persisted, items, true);
        await this.storageClient.saveObject(Namespaces.LANDING_PAGES, updatedLandingNodes);

        return items;
    }

    public async updateChild(node: LandingNode): Promise<void> {
        const persisted =
            (await this.storageClient.getObject<PersistedLandingNode[][]>(Namespaces.LANDING_PAGES)) ?? [];
        const updatedNodes = extractChildrenNodes(node, node.parent);

        const updatedLandingNodes = updateLandingNode(persisted, updatedNodes);

        await this.storageClient.saveObject(Namespaces.LANDING_PAGES, updatedLandingNodes);
    }

    public async removeChilds(ids: string[]): Promise<void> {
        const nodes = (await this.storageClient.getObject<PersistedLandingNode[][]>(Namespaces.LANDING_PAGES)) ?? [];

        const newNodes = nodes.map(models => {
            const root = models.find(model => model.type === "root");
            if (!root) throw new Error("No value for root");

            const node = LandingNodeModel.decode(buildDomainLandingNode(root, models)).toMaybe().extract();
            if (!node) throw new Error("No value for node");

            const childNodes = extractChildrenNodes(node, root.id);

            return _.reject(childNodes, ({ id, parent }) => ids.includes(id) || ids.includes(parent));
        });

        const parentIds = _.union(...newNodes.map(node => node.map(node => node.id)));
        const updatedNodes = newNodes
            .filter(node => node.find(model => model.type === "root"))
            .map(node => node.filter(item => parentIds.includes(item.parent)))
            .map(node => node.map(n => (n.type === "root" ? { ...n, parent: "none" } : n)));

        await this.storageClient.saveObject(Namespaces.LANDING_PAGES, updatedNodes);
    }

    public async exportTranslations(ids: string[]): Promise<void> {
        const models = (await this.storageClient.getObject<PersistedLandingNode[][]>(Namespaces.LANDING_PAGES)) ?? [];

        const toTranslate = models.find(model => model.find(item => ids.includes(item.id)));
        if (!toTranslate) throw new Error(`Unable to load landing pages`);

        const translations = await this.extractTranslations(toTranslate);
        const files = _.toPairs(translations);
        const zip = new JSZip();

        for (const [lang, contents] of files) {
            const json = JSON.stringify(contents, null, 4);
            const blob = new Blob([json], { type: "application/json" });
            zip.file(`${lang}.json`, blob);
        }

        const blob = await zip.generateAsync({ type: "blob" });
        FileSaver.saveAs(blob, `translations-landing-page.zip`);
    }

    public async importTranslations(language: string, terms: Record<string, string>, key: string): Promise<number> {
        const persisted =
            (await this.storageClient.getObject<PersistedLandingNode[][]>(Namespaces.LANDING_PAGES)) ?? [];

        const translate = <T extends TranslatableText>(item: T, language: string, term: string | undefined): T => {
            if (term === undefined) {
                return item;
            } else if (language === "en") {
                return { ...item, referenceValue: term };
            } else {
                return { ...item, translations: { ...item.translations, [language]: term } };
            }
        };

        const toTranslate = persisted.find(model => model.find(item => item.id === key));
        if (!toTranslate) throw new Error(`Unable to load landing pages`);

        const translatedModels: PersistedLandingNode[] = toTranslate.map(model => ({
            ...model,
            name: translate(model.name, language, terms[model.name.key]),
            title: model.title ? translate(model.title, language, terms[model.title.key]) : undefined,
            content: model.content ? translate(model.content, language, terms[model.content.key]) : undefined,
        }));

        const updatedLandingNodes = persisted.map(model => {
            const shouldReplace = model.some(obj => translatedModels.map(obj => obj.id).includes(obj.id));
            return shouldReplace ? translatedModels : model;
        });

        await this.storageClient.saveObject<PersistedLandingNode[][]>(Namespaces.LANDING_PAGES, updatedLandingNodes);

        const translations = await this.extractTranslations(translatedModels);

        return _.intersection(_.keys(translations["en"]), _.keys(terms)).length;
    }

    public async swapOrder(node1: LandingNode, node2: LandingNode) {
        const nodes = (await this.storageClient.getObject<PersistedLandingNode[][]>(Namespaces.LANDING_PAGES)) ?? [];

        const updatedLandingNodes = nodes.map(node => {
            if (node.some(item => item.id === node1.id) || node.some(item => item.id === node2.id)) {
                return _.uniqWith(
                    [
                        { ..._.omit(node1, ["children"]), order: node2.order },
                        { ..._.omit(node2, ["children"]), order: node1.order },
                        ...node,
                    ],
                    (arr, oth) => arr.id === oth.id
                );
            } else {
                return [...node];
            }
        });

        await this.storageClient.saveObject(Namespaces.LANDING_PAGES, updatedLandingNodes);
    }

    private async extractTranslations(models: PersistedLandingNode[]): Promise<Record<string, Record<string, string>>> {
        const texts = _.flatMap(models, model => _.compact([model.name, model.title, model.content]));

        const referenceStrings = _.fromPairs(texts.map(({ key, referenceValue }) => [key, referenceValue]));
        const translatedStrings = _(texts)
            .flatMap(({ key, translations }) => _.toPairs(translations).map(([lang, value]) => ({ lang, key, value })))
            .groupBy("lang")
            .mapValues(array => _.fromPairs(array.map(({ key, value }) => [key, value])))
            .value();

        return { ...translatedStrings, en: referenceStrings };
    }
}

const buildDomainLandingNode = (root: PersistedLandingNode, items: PersistedLandingNode[]): LandingNode => {
    return {
        ...root,
        children: _(items)
            .filter(({ parent }) => parent === root.id)
            .sortBy(item => item.order ?? 1000)
            .map((node, order) => ({ ...buildDomainLandingNode(node, items), order }))
            .value(),
    };
};

const extractChildrenNodes = (node: BaseNode, parent: string): PersistedLandingNode[] => {
    const { children, ...props } = node;
    const childrenNodes = _.flatMap(children, child => (child ? extractChildrenNodes(child, node.id) : []));

    return [{ ...props, parent } as PersistedLandingNode, ...childrenNodes];
};

const updateLandingNode = (
    models: PersistedLandingNode[][],
    items: PersistedLandingNode[],
    importNewNode?: boolean
) => {
    const rootItem = items.find(item => item.type === "root");
    const isItemSavedInDatastore = models.some(model => model.find(persisted => persisted.id === items[0]?.id));

    if (isItemSavedInDatastore) {
        return models.map(model => model.map(persisted => (persisted.id === items[0]?.id ? items[0] : persisted)));
    } else if (importNewNode) {
        return _.concat(models, [items]);
    } else {
        const newLandingNode = models.map(modelGroup => {
            const landingNode = modelGroup.find(model => model.id === rootItem?.parent);
            if (!landingNode) {
                return [...modelGroup, ...items];
            } else return modelGroup;
        });

        return newLandingNode;
    }
};

interface BaseNode {
    id: string;
    children: (BaseNode | undefined)[];
}
