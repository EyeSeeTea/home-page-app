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
            const persisted = await this.storageClient.listObjectsInCollection<PersistedLandingNode>(
                Namespaces.LANDING_PAGES
            );

            const root = persisted?.find(({ parent }) => parent === "none");

            if (persisted.length === 0 || !root) {
                const root = {
                    id: generateUid(),
                    parent: "none",
                    type: "root" as const,
                    icon: "/img/logo-eyeseetea.png",
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
                };

                await this.storageClient.saveObjectInCollection<PersistedLandingNode>(Namespaces.LANDING_PAGES, root);
                return [{ ...root, children: [] }];
            }

            const validation = LandingNodeModel.decode(buildDomainLandingNode(root, persisted));

            if (validation.isLeft()) {
                throw new Error(validation.extract());
            }

            return _.compact([validation.toMaybe().extract()]);
        } catch (error: any) {
            console.error(error);
            return [];
        }
    }

    public async export(ids: string[]): Promise<void> {
        const nodes = await this.storageClient.listObjectsInCollection<PersistedLandingNode>(Namespaces.LANDING_PAGES);
        const toExport = _(nodes)
            .filter(({ id }) => ids.includes(id))
            .flatMap(node => extractChildrenNodes(buildDomainLandingNode(node, nodes), node.parent))
            .flatten()
            .value();

        return this.importExportClient.export(toExport);
    }

    public async import(files: File[]): Promise<PersistedLandingNode[]> {
        const items = await this.importExportClient.import<PersistedLandingNode>(files);
        // TODO: Do not overwrite existing landing page
        await this.storageClient.saveObject(Namespaces.LANDING_PAGES, items);

        return items;
    }

    public async updateChild(node: LandingNode): Promise<void> {
        const updatedNodes = extractChildrenNodes(node, node.parent);
        await this.storageClient.saveObjectsInCollection<PersistedLandingNode>(Namespaces.LANDING_PAGES, updatedNodes);
    }

    public async removeChilds(ids: string[]): Promise<void> {
        const nodes = await this.storageClient.listObjectsInCollection<PersistedLandingNode>(Namespaces.LANDING_PAGES);
        const toDelete = _(nodes)
            .filter(({ id }) => ids.includes(id))
            .map(node => LandingNodeModel.decode(buildDomainLandingNode(node, nodes)).toMaybe().extract())
            .compact()
            .flatMap(node => [node.id, extractChildrenNodes(node, node.parent).map(({ id }) => id)])
            .flatten()
            .value();

        await this.storageClient.removeObjectsInCollection(Namespaces.LANDING_PAGES, toDelete);
    }

    public async exportTranslations(): Promise<void> {
        const models = await this.storageClient.getObject<PersistedLandingNode[]>(Namespaces.LANDING_PAGES);
        if (!models) throw new Error(`Unable to load landing pages`);

        const translations = await this.extractTranslations(models);
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

    public async importTranslations(language: string, terms: Record<string, string>): Promise<number> {
        const models = await this.storageClient.getObject<PersistedLandingNode[]>(Namespaces.LANDING_PAGES);
        if (!models) throw new Error(`Unable to load landing pages`);

        const translate = <T extends TranslatableText>(item: T, language: string, term: string | undefined): T => {
            if (term === undefined) {
                return item;
            } else if (language === "en") {
                return { ...item, referenceValue: term };
            } else {
                return { ...item, translations: { ...item.translations, [language]: term } };
            }
        };

        const translatedModels: PersistedLandingNode[] = models.map(model => ({
            ...model,
            name: translate(model.name, language, terms[model.name.key]),
            title: model.title ? translate(model.title, language, terms[model.title.key]) : undefined,
            content: model.content ? translate(model.content, language, terms[model.content.key]) : undefined,
        }));

        await this.storageClient.saveObject<PersistedLandingNode[]>(Namespaces.LANDING_PAGES, translatedModels);

        const translations = await this.extractTranslations(models);
        return _.intersection(_.keys(translations["en"]), _.keys(terms)).length;
    }

    public async swapOrder(node1: LandingNode, node2: LandingNode) {
        await this.storageClient.saveObjectsInCollection(Namespaces.LANDING_PAGES, [
            { ...node1, order: node2.order },
            { ...node2, order: node1.order },
        ]);
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

interface BaseNode {
    id: string;
    children: (BaseNode | undefined)[];
}
