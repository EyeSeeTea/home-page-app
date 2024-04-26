import _ from "lodash";
import { LandingNode, LandingNodeModel } from "../../domain/entities/LandingNode";
import { LandingNodeRepository } from "../../domain/repositories/LandingNodeRepository";
import { Namespaces } from "../clients/storage/Namespaces";
import { StorageClient } from "../clients/storage/StorageClient";
import { PersistedLandingNode, PersistedLandingPage } from "../entities/PersistedLandingNode";
import { generateUid } from "../utils/uid";
import { Maybe } from "../../types/utils";

export class LandingNodeDefaultRepository implements LandingNodeRepository {
    constructor(private storageClient: StorageClient) {}

    public async getAll(): Promise<LandingNode[]> {
        try {
            const persisted = await this.getPersistedLandingPages();

            const roots = _.every(persisted, persist => Array.isArray(persist))
                ? persisted.flatMap(model => model?.filter(({ parent }) => parent === "none"))
                : [];

            const validations = roots.map(root =>
                LandingNodeModel.decode(
                    buildDomainLandingNode(
                        root,
                        persisted.find(model => model.find(item => item.parent === root.id)) ?? []
                    )
                )
            );

            _.forEach(validations, validation => {
                if (validation.isLeft()) {
                    throw new Error(validation.extract());
                }
            });

            if (persisted.length === 0 || roots.length === 0) {
                return await this.saveDefaultLandingPage();
            }

            return _.flatten(validations.map(validation => _.compact([validation.toMaybe().extract()])));
        } catch (error: any) {
            console.error(error);
            return [];
        }
    }

    private async saveDefaultLandingPage() {
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
            secondary: false,
            executeOnInit: true,
        };

        await this.storageClient.saveObject<PersistedLandingNode[][]>(Namespaces.LANDING_PAGES, [[root]]);
        return [{ ...root, children: [] }];
    }

    public async getById(id: string): Promise<Maybe<LandingNode>> {
        //using getAll instead of find by id on dataStore in order to get children populated
        return (await this.getAll()).find(node => node.id === id);
    }

    public async save(landingNodes: PersistedLandingPage[]) {
        await this.storageClient.saveObject(Namespaces.LANDING_PAGES, landingNodes);
    }

    public getPersistedLandingPages(): Promise<PersistedLandingPage[]> {
        return this.storageClient
            .getObject<PersistedLandingNode[][]>(Namespaces.LANDING_PAGES)
            .then(nodes => nodes ?? []);
    }

    public async create(node: LandingNode): Promise<void> {
        const persisted =
            (await this.storageClient.getObject<PersistedLandingNode[][]>(Namespaces.LANDING_PAGES)) ?? [];
        const updatedNodes = extractChildrenNodes(node, node.parent);

        const updatedLandingNodes = updateLandingNode(persisted, updatedNodes, true);

        await this.storageClient.saveObject(Namespaces.LANDING_PAGES, updatedLandingNodes);
    }

    public async update(node: LandingNode): Promise<void> {
        const persisted =
            (await this.storageClient.getObject<PersistedLandingNode[][]>(Namespaces.LANDING_PAGES)) ?? [];
        const updatedNodes = extractChildrenNodes(node, node.parent);

        const updatedLandingNodes = updateLandingNode(persisted, updatedNodes);

        await this.storageClient.saveObject(Namespaces.LANDING_PAGES, updatedLandingNodes);
    }

    public async deleteNodes(ids: string[]): Promise<void> {
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

const areItemsInModels = (models: PersistedLandingNode[][], items: PersistedLandingNode[]): boolean => {
    return models.some(nodes => {
        return _.intersectionBy(nodes, items, node => node.id).length > 0;
    });
};

const replaceNodesWithItems = (
    models: PersistedLandingNode[][],
    items: PersistedLandingNode[]
): PersistedLandingNode[][] => {
    return models.map(model => {
        return model.map(persisted => items.find(item => item.id === persisted.id) || persisted);
    });
};

const appendItemsToModels = (
    models: PersistedLandingNode[][],
    items: PersistedLandingNode[]
): PersistedLandingNode[][] => {
    return _.concat(models, [items]);
};

const addItemsToGroupsWithoutParent = (
    models: PersistedLandingNode[][],
    items: PersistedLandingNode[],
    rootItem?: PersistedLandingNode
): PersistedLandingNode[][] => {
    return models.map(modelGroup => {
        const landingNode = modelGroup.find(model => model.id === rootItem?.parent);
        if (!landingNode) {
            return [...modelGroup, ...items];
        } else return modelGroup;
    });
};

export const updateLandingNode = (
    persistedLandingNodes: PersistedLandingNode[][],
    items: PersistedLandingNode[],
    importNewNode?: boolean
): PersistedLandingNode[][] => {
    const rootItem = items.find(item => item.type === "root");
    const isItemSavedInDatastore = areItemsInModels(persistedLandingNodes, items);

    if (isItemSavedInDatastore) {
        return replaceNodesWithItems(persistedLandingNodes, items);
    } else if (importNewNode) {
        return appendItemsToModels(persistedLandingNodes, items);
    } else {
        return addItemsToGroupsWithoutParent(persistedLandingNodes, items, rootItem);
    }
};

interface BaseNode {
    id: string;
    children: (BaseNode | undefined)[];
}

export const extractChildrenNodes = (node: BaseNode, parent: string): PersistedLandingNode[] => {
    const { children, ...props } = node;
    const childrenNodes = _.flatMap(children, child => (child ? extractChildrenNodes(child, node.id) : []));

    return [{ ...props, parent } as PersistedLandingNode, ...childrenNodes];
};
