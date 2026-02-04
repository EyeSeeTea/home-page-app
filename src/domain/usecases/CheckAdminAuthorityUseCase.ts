import { UseCase } from "./UseCase";
import { UserRepository } from "../repositories/UserRepository";

export class CheckAdminAuthorityUseCase implements UseCase {
    constructor(private userRepository: UserRepository) {}

    public async execute(): Promise<boolean> {
        const user = await this.userRepository.getCurrentUser().toPromise();

        return !!user.userRoles.find(role => role.authorities.find(authority => authority === "ALL"));
    }
}
