import { PartialAction } from "../entities/Action";
import { ActionRepository } from "../repositories/ActionRepository";
import { UseCase } from "./UseCase";

export class UpdateActionUseCase implements UseCase {
    constructor(private ActionRepository: ActionRepository) {}

    public async execute(action: PartialAction): Promise<void> {
        return this.ActionRepository.update(action);
    }
}
