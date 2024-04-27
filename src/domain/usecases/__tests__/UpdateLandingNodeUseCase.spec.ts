import { PersistedLandingPage } from "../../../data/entities/PersistedLandingNode";
import { Maybe } from "../../../types/utils";
import { LandingNode } from "../../entities/LandingNode";
import { LandingNodeRepository } from "../../repositories/LandingNodeRepository";
import {
    UpdateLandingNodeUseCase,
    validateNoDuplicatedNode,
    validateParentsInSameLandingTree,
} from "../UpdateLandingNodeUseCase";
import { childrenOutOfPlace, duplicatedNodes, validLandingPagesTree } from "./landingNodeFixtures";

export class DummyLandingNodeTestRepository implements LandingNodeRepository {
    public async getById(_id: string): Promise<Maybe<LandingNode>> {
        throw new Error("Method not implemented.");
    }

    public async getAll(): Promise<LandingNode[]> {
        throw new Error("Method not implemented.");
    }

    public async getPersistedLandingPages(): Promise<PersistedLandingPage[]> {
        return validLandingPagesTree;
    }

    public async create(_node: LandingNode): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async deleteNodes(_ids: string[]): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async save(_landingNodes: PersistedLandingPage[]): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

describe("UpdateLandingNodeUseCase", () => {
    const landingNodesRepository = new DummyLandingNodeTestRepository();
    const _updateLandingNodeUseCase = new UpdateLandingNodeUseCase(landingNodesRepository);

    // Testing use case
    /* it("should throw an error if there are duplicated LandingNodes", async () => {
         const promise = updateLandingNodeUseCase.execute(sectionNode);

         await expect(promise).rejects.toThrowError();
     }); */
});

describe("validateNoDuplicatedNode", () => {
    it("should return landingPages if there is not any duplicated LandingNodes", async () => {
        const landingPages = validLandingPagesTree;

        expect(validateNoDuplicatedNode(landingPages)).toBe(landingPages);
    });

    it("should throw an error if there are duplicated LandingNodes", async () => {
        const landingPages = duplicatedNodes();

        expect(() => validateNoDuplicatedNode(landingPages)).toThrowError();
    });
});

describe("validateParentsInSameLandingTree", () => {
    it("should return landingPages if all children are on their respective trees", async () => {
        const landingPages = validLandingPagesTree;

        expect(validateParentsInSameLandingTree(landingPages)).toBe(landingPages);
    });

    it("should throw an error if a child node does not have its parent in the children tree", async () => {
        const landingPages = childrenOutOfPlace();

        expect(() => validateParentsInSameLandingTree(landingPages)).toThrowError();
    });
});
