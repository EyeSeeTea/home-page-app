import { ActionRepository } from "../repositories/ActionRepository";
import { UseCase } from "./UseCase";

export class SwapActionOrderUseCase implements UseCase {
    constructor(private ActionRepository: ActionRepository) {}

    public async execute(id1: string, id2: string): Promise<void> {
        return this.ActionRepository.swapOrder(id1, id2);
    }
}
