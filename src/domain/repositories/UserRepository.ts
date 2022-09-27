import { User } from "../entities/User";
import { FutureData } from "../types/Future";

export interface UserRepository {
    getCurrentUser(): FutureData<User>;
}
