import { LandingNode } from "../entities/LandingNode";
import { LandingNodeRepository } from "../repositories/LandingNodeRepository";
import { UseCase } from "./UseCase";

export class CreateLandingNodeUseCase implements UseCase {
    constructor(private landingNodesRepository: LandingNodeRepository) {}

    public async execute(node: LandingNode): Promise<void> {
        return this.landingNodesRepository.create(node);
    }
}
