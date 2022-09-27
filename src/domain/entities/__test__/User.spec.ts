import { isSuperAdmin, User } from "../User";

describe("User isSuperAdmin", () => {
    it("should return true if user contains authority all", () => {
        const user: User = {
            id: "1",
            name: "example",
            username: "example",
            userRoles: [
                { id: "1", name: "role 1", authorities: ["ALL"] },
                { id: "2", name: "role 2", authorities: [] },
            ],
            userGroups: [],
        };

        expect(isSuperAdmin(user)).toBe(true);
    });
    it("should return true if user does not contains authority all", () => {
        const user: User = {
            id: "1",
            name: "example",
            username: "example",
            userRoles: [
                { id: "1", name: "role 1", authorities: [] },
                { id: "2", name: "role 2", authorities: [] },
            ],
            userGroups: [],
        };

        expect(isSuperAdmin(user)).toBe(false);
    });
});
