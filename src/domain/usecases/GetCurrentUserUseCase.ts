import { UseCase } from "./UseCase";
import { FutureData } from "../types/Future";
import { User } from "../entities/User";
import { UserRepository } from "../repositories/UserRepository";

export class GetCurrentUserUseCase implements UseCase {
    constructor(private repository: UserRepository) {}

    public execute(): FutureData<User> {
        return this.repository.getCurrentUser();
    }
}
