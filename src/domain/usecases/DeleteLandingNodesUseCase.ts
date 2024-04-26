import { LandingNodeRepository } from "../repositories/LandingNodeRepository";
import { UseCase } from "./UseCase";

export class DeleteLandingNodesUseCase implements UseCase {
    constructor(private landingPagesRepository: LandingNodeRepository) {}

    public async execute(ids: string[]): Promise<void> {
        return this.landingPagesRepository.deleteNodes(ids);
    }
}
