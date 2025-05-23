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
                LandingNodeModel.decode(buildLandingNode(root, _.flatten(persisted)))
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
            iconSize: "small",
            favicon: "img/logo-eyeseetea.png",
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

        await this.storageClient.saveObject<PersistedLandingPage[]>(Namespaces.LANDING_PAGES, [[root]]);
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
            .getObject<PersistedLandingPage[]>(Namespaces.LANDING_PAGES)
            .then(nodes => nodes ?? []);
    }

    public async create(node: LandingNode): Promise<void> {
        const persisted = (await this.storageClient.getObject<PersistedLandingPage[]>(Namespaces.LANDING_PAGES)) ?? [];
        const updatedNodes = extractChildrenNodes(node, node.parent);

        const updatedLandingNodes = updateLandingNode(persisted, updatedNodes, true);

        await this.storageClient.saveObject(Namespaces.LANDING_PAGES, updatedLandingNodes);
    }

    public async deleteNodes(ids: string[]): Promise<void> {
        const nodes = (await this.storageClient.getObject<PersistedLandingPage[]>(Namespaces.LANDING_PAGES)) ?? [];

        const newNodes = _(nodes)
            .map(models => {
                if (_.isEmpty(models)) return undefined;

                const root = models.find(model => model.type === "root");
                if (!root) throw new Error("No value for root");

                const node = LandingNodeModel.decode(buildLandingNode(root, models)).toMaybe().extract();
                if (!node) throw new Error("No value for node");

                const childNodes = extractChildrenNodes(node, root.id);

                return _.reject(childNodes, ({ id, parent }) => ids.includes(id) || ids.includes(parent));
            })
            .compact()
            .value();

        const parentIds = _.union(...newNodes.map(node => node.map(node => node.id)));
        const updatedNodes = newNodes
            .filter(node => node.find(model => model.type === "root"))
            .map(node => node.filter(item => parentIds.includes(item.parent)))
            .map(node => node.map(n => (n.type === "root" ? { ...n, parent: "none" } : n)));

        await this.storageClient.saveObject(Namespaces.LANDING_PAGES, updatedNodes);
    }
}

export const buildLandingNode = (root: PersistedLandingNode, items: PersistedLandingNode[]): LandingNode => {
    return {
        ...root,
        children: _(items)
            .filter(({ parent }) => parent === root.id)
            .sortBy(item => item.order ?? 1000)
            .map((node, order) => ({ ...buildLandingNode(node, items), order }))
            .value(),
    };
};

const areItemsInModels = (landingTrees: PersistedLandingPage[], items: PersistedLandingNode[]): boolean => {
    return landingTrees.some(tree => _.intersectionBy(tree, items, node => node.id).length > 0);
};

const replaceNodesWithItems = (
    landingTrees: PersistedLandingPage[],
    items: PersistedLandingNode[]
): PersistedLandingPage[] => {
    return landingTrees.map(tree => {
        return tree.map(persisted => items.find(item => item.id === persisted.id) || persisted);
    });
};

const appendItemsToModels = (
    landingTrees: PersistedLandingPage[],
    items: PersistedLandingNode[]
): PersistedLandingPage[] => {
    return _.concat(landingTrees, [items]);
};

const addItemsToGroupsWithoutParent = (
    landingTrees: PersistedLandingPage[],
    item: PersistedLandingNode
): PersistedLandingPage[] => {
    return landingTrees.map(tree => {
        const parentInTree = tree.some(node => node.id === item.parent);
        if (parentInTree) {
            return _.concat(tree, item);
        } else {
            return tree;
        }
    });
};

export const updateLandingNode = (
    persistedLandingTrees: PersistedLandingPage[],
    items: PersistedLandingNode[],
    importNewNode?: boolean
): PersistedLandingPage[] => {
    const isItemSavedInDatastore = areItemsInModels(persistedLandingTrees, items);

    if (isItemSavedInDatastore) {
        return replaceNodesWithItems(persistedLandingTrees, items);
    } else if (importNewNode) {
        //only being called when creating landing page or when import nodes
        return appendItemsToModels(persistedLandingTrees, items);
    } else {
        //onlye being called when creating section, sub-section, or category
        const itemCreated = items[0];
        if (!itemCreated || items.length > 1)
            throw new Error("Unexpected error: 'there is no item to create' or 'creating more than one item'");
        return addItemsToGroupsWithoutParent(persistedLandingTrees, itemCreated);
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
