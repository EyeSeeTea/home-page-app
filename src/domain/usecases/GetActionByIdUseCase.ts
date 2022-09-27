import { Action } from "../entities/Action";
import { ActionRepository } from "../repositories/ActionRepository";
import { UseCase } from "./UseCase";

export class GetActionByIdUseCase implements UseCase {
    constructor(private actionRepository: ActionRepository) {}

    public async execute(id: string): Promise<Action | undefined> {
        return this.actionRepository.get(id);
    }
}
