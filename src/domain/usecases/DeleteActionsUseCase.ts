import { ActionRepository } from "../repositories/ActionRepository";
import { UseCase } from "./UseCase";

export class DeleteActionsUseCase implements UseCase {
    constructor(private actionRespository: ActionRepository) {}

    public async execute(ids: string[]): Promise<void> {
        return this.actionRespository.delete(ids);
    }
}
