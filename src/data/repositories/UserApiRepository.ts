import { FutureData } from "../../domain/types/Future";
import { User } from "../../domain/entities/User";
import { cache } from "../../utils/cache";
import { Instance } from "../entities/Instance";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { D2ApiUser } from "../common/D2ApiUser";

export class UserApiRepository implements UserRepository {
    private d2ApiUser: D2ApiUser;

    constructor(instance: Instance) {
        this.d2ApiUser = new D2ApiUser(instance);
    }

    @cache()
    public getCurrentUser(): FutureData<User> {
        return this.d2ApiUser.getCurrentUser();
    }
}
