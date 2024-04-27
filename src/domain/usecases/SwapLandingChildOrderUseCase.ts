import _ from "lodash";
import { LandingNode } from "../entities/LandingNode";
import { LandingNodeRepository } from "../repositories/LandingNodeRepository";
import { UseCase } from "./UseCase";

export class SwapLandingChildOrderUseCase implements UseCase {
    constructor(private landingNodesRepository: LandingNodeRepository) {}

    public async execute(node1: LandingNode, node2: LandingNode): Promise<void> {
        const nodes = await this.landingNodesRepository.getPersistedLandingPages();

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

        return await this.landingNodesRepository.save(updatedLandingNodes);
    }
}
