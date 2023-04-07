import { UseCase } from "./UseCase";
import { ConfigRepository } from "../repositories/ConfigRepository";
import { User } from "../entities/User";

export class GetUserUseCase implements UseCase {
    constructor(private configRepository: ConfigRepository) {}

    public async execute(): Promise<User> {
        return this.configRepository.getUser();
    }
}
