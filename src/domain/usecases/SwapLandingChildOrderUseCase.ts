import { LandingNode } from "../entities/LandingNode";
import { LandingNodeRepository } from "../repositories/LandingNodeRepository";
import { UseCase } from "./UseCase";

export class SwapLandingChildOrderUseCase implements UseCase {
    constructor(private landingNodesRepository: LandingNodeRepository) {}

    public async execute(node1: LandingNode, node2: LandingNode): Promise<void> {
        return this.landingNodesRepository.swapOrder(node1, node2);
    }
}
