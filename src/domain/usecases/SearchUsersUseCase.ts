import { InstanceRepository } from "../repositories/InstanceRepository";
import { UserSearch } from "../../data/entities/SearchUser";
import { UseCase } from "./UseCase";

export class SearchUsersUseCase implements UseCase {
    constructor(private instanceRepository: InstanceRepository) {}

    public async execute(query: string): Promise<UserSearch> {
        return this.instanceRepository.searchUsers(query);
    }
}
