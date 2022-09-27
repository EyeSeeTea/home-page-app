import { LandingNodeRepository } from "../repositories/LandingNodeRepository";
import { UseCase } from "./UseCase";

export class DeleteLandingChildUseCase implements UseCase {
    constructor(private landingPagesRepository: LandingNodeRepository) {}

    public async execute(ids: string[]): Promise<void> {
        return this.landingPagesRepository.removeChilds(ids);
    }
}
