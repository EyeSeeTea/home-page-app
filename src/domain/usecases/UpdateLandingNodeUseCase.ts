import _ from "lodash";
import { LandingNode } from "../entities/LandingNode";
import { LandingNodeRepository } from "../repositories/LandingNodeRepository";
import { UseCase } from "./UseCase";
import { PersistedLandingNode, PersistedLandingPage } from "../../data/entities/PersistedLandingNode";

export class UpdateLandingNodeUseCase implements UseCase {
    constructor(private landingNodesRepository: LandingNodeRepository) {}

    public async execute(node: LandingNode): Promise<void> {
        // Domain shouldn't know about PersistedLandingPage, but .save is used in several files using PersistedLandingPage
        const landingPages = await this.landingNodesRepository.getPersistedLandingPages();

        const updatedNodes = extractChildrenNodes(node, node.parent);
        const updatedLandingNodes = updateLandingPages(landingPages, updatedNodes);

        return this.landingNodesRepository.save(
            validateParentsInSameLandingTree(validateNoDuplicatedNode(updatedLandingNodes))
        );
    }
}

/* Validations should be done in the domain entity (LandingNode also not Persisted one)
 * done here because entity doesn't allow it for now */
export function validateNoDuplicatedNode(landingTrees: PersistedLandingPage[]): PersistedLandingPage[] {
    const duplicatedItems = _(landingTrees)
        .flatten()
        .groupBy("id")
        .pickBy(items => items.length > 1)
        .keys()
        .value();

    if (!_.isEmpty(duplicatedItems)) throw new Error(`Duplicated nodes found with ids: ${duplicatedItems.join(", ")}`);
    return landingTrees;
}

export function validateParentsInSameLandingTree(landingTrees: PersistedLandingPage[]): PersistedLandingPage[] {
    const childrenOutOfPlace = landingTrees.flatMap(tree => {
        return tree
            .filter(node => node.parent !== "none" || node.type !== "root")
            .filter(node => !tree.some(parent => parent.id === node.parent))
            .map(({ id }) => id);
    });
    // const valid = landingTrees.every(tree => tree.every(node => tree.some(parent => parent.id === node.parent)));

    if (!_.isEmpty(childrenOutOfPlace))
        throw new Error(`The parent node of children: ${childrenOutOfPlace.join(", ")}; is not in the tree.`);
    return landingTrees;
}

interface BaseNode {
    id: string;
    children: (BaseNode | undefined)[];
}

export const extractChildrenNodes = (node: BaseNode, parent: string): PersistedLandingNode[] => {
    const { children, ...props } = node;
    const childrenNodes = _.flatMap(children, child => (child ? extractChildrenNodes(child, node.id) : []));

    return [{ ...props, parent } as LandingNode, ...childrenNodes];
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

const addItemsToParentsLanding = (
    landingTrees: PersistedLandingPage[],
    item: PersistedLandingNode
): PersistedLandingPage[] => {
    return landingTrees.map(tree => {
        const isParentInTree = tree.some(node => node.id === item.parent);
        return isParentInTree ? _.concat(tree, item) : tree;
    });
};

export const updateLandingPages = (
    persistedLandingTrees: PersistedLandingPage[],
    items: PersistedLandingNode[]
): PersistedLandingPage[] => {
    const isUpdate = areItemsInModels(persistedLandingTrees, items);

    if (isUpdate) {
        return replaceNodesWithItems(persistedLandingTrees, items);
    } else {
        // only being called when creating section, sub-section, or category
        const itemCreated = items[0];
        if (!itemCreated || items.length > 1)
            throw new Error("Unexpected error: 'there is no item to create' or 'creating more than one item'");
        return addItemsToParentsLanding(persistedLandingTrees, itemCreated);
    }
};
