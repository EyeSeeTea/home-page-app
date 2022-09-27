import { Action } from "../entities/Action";
import { ActionRepository } from "../repositories/ActionRepository";
import { UseCase } from "./UseCase";

export class ListActionsUseCase implements UseCase {
    constructor(private ActionRepository: ActionRepository) {}

    public async execute(): Promise<Action[]> {
        return this.ActionRepository.list();
    }
}
