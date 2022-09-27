import { LandingNode } from "../entities/LandingNode";
import { LandingNodeRepository } from "../repositories/LandingNodeRepository";
import { UseCase } from "./UseCase";

export class ListLandingChildrenUseCase implements UseCase {
    constructor(private landingNodeRepository: LandingNodeRepository) {}

    public async execute(): Promise<LandingNode[]> {
        return this.landingNodeRepository.list();
    }
}
