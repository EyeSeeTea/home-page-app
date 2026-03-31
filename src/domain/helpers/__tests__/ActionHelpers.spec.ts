import { Action } from "../../entities/Action";
import { User } from "../../entities/User";
import { getPageActions, getUserActions } from "../ActionHelpers";

function buildAction(overrides: Partial<Action> = {}): Action {
    return {
        id: "action-1",
        name: { key: "name", referenceValue: "Action 1", translations: {} },
        description: { key: "description", referenceValue: "", translations: {} },
        icon: "",
        iconLocation: "",
        backgroundColor: "",
        fontColor: "",
        textAlignment: "",
        type: "app",
        disabled: false,
        dhisVersionRange: "",
        dhisAppKey: "",
        dhisLaunchUrl: "",
        launchPageId: "",
        dhisAuthorities: [],
        installed: true,
        compatible: true,
        editable: true,
        user: { id: "owner-1", name: "Owner" },
        created: new Date(),
        lastUpdated: new Date(),
        lastUpdatedBy: { id: "owner-1", name: "Owner" },
        publicAccess: "--------",
        userAccesses: [],
        userGroupAccesses: [],
        ...overrides,
    };
}

function buildUser(overrides: Partial<User> = {}): User {
    return {
        id: "user-1",
        name: "Test User",
        username: "testuser",
        userRoles: [],
        userGroups: [],
        ...overrides,
    };
}

describe("getUserActions", () => {
    describe("expected use", () => {
        it("returns action IDs where the user has direct user access", () => {
            const user = buildUser({ id: "user-1" });
            const actions = [
                buildAction({ id: "a1", userAccesses: [{ id: "user-1", name: "Test User", access: "r-------" }] }),
                buildAction({ id: "a2", userAccesses: [] }),
            ];

            const result = getUserActions(actions, user);

            expect(result).toEqual(["a1"]);
        });

        it("returns action IDs where the action is public", () => {
            const user = buildUser();
            const actions = [
                buildAction({ id: "a1", publicAccess: "r-------" }),
                buildAction({ id: "a2", publicAccess: "--------" }),
            ];

            const result = getUserActions(actions, user);

            expect(result).toEqual(["a1"]);
        });

        it("returns multiple action IDs when the user qualifies through different access types", () => {
            const user = buildUser({
                id: "user-1",
                userGroups: [{ id: "group-1", name: "Group A" }],
            });
            const actions = [
                buildAction({ id: "a1", userAccesses: [{ id: "user-1", name: "Test User", access: "r-------" }] }),
                buildAction({
                    id: "a2",
                    userGroupAccesses: [{ id: "group-1", name: "Group A", access: "r-------" }],
                }),
                buildAction({ id: "a3", publicAccess: "rw------" }),
            ];

            const result = getUserActions(actions, user);

            expect(result).toEqual(["a1", "a2", "a3"]);
        });
    });

    describe("edge cases", () => {
        it("returns action IDs where the user belongs to a matching user group", () => {
            const user = buildUser({
                userGroups: [
                    { id: "group-1", name: "Group A" },
                    { id: "group-2", name: "Group B" },
                ],
            });
            const actions = [
                buildAction({
                    id: "a1",
                    userGroupAccesses: [{ id: "group-2", name: "Group B", access: "r-------" }],
                }),
                buildAction({
                    id: "a2",
                    userGroupAccesses: [{ id: "group-99", name: "Other Group", access: "r-------" }],
                }),
            ];

            const result = getUserActions(actions, user);

            expect(result).toEqual(["a1"]);
        });

        it('treats "--------" publicAccess as no public access', () => {
            const user = buildUser();
            const actions = [buildAction({ id: "a1", publicAccess: "--------" })];

            const result = getUserActions(actions, user);

            expect(result).toEqual([]);
        });

        it("returns an empty array when the actions list is empty", () => {
            const user = buildUser();

            const result = getUserActions([], user);

            expect(result).toEqual([]);
        });
    });

    describe("failure cases", () => {
        it("returns an empty array when the user has no matching access on any action", () => {
            const user = buildUser({ id: "user-1", userGroups: [] });
            const actions = [
                buildAction({
                    id: "a1",
                    publicAccess: "--------",
                    userAccesses: [{ id: "user-99", name: "Other User", access: "r-------" }],
                    userGroupAccesses: [{ id: "group-99", name: "Other Group", access: "r-------" }],
                }),
            ];

            const result = getUserActions(actions, user);

            expect(result).toEqual([]);
        });
    });
});

describe("getPageActions", () => {
    describe("expected use", () => {
        it("returns all action IDs when isRoot and showAllActions are true, ignoring sharing", () => {
            const user = buildUser();
            const allActions = [buildAction({ id: "a1" }), buildAction({ id: "a2" }), buildAction({ id: "a3" })];

            const result = getPageActions(true, true, allActions, user, []);

            expect(result).toEqual(["a1", "a2", "a3"]);
        });

        it("returns only visible action IDs filtered by user access when not root+showAll", () => {
            const user = buildUser({ id: "user-1" });
            const currentPageActions = [
                buildAction({ id: "a1", userAccesses: [{ id: "user-1", name: "Test User", access: "r-------" }] }),
                buildAction({ id: "a2", publicAccess: "--------" }),
            ];

            const result = getPageActions(false, false, [], user, currentPageActions);

            expect(result).toEqual(["a1"]);
        });
    });

    describe("edge cases", () => {
        it("falls through to getUserActions when isRoot is true but showAllActions is false", () => {
            const user = buildUser({ id: "user-1" });
            const currentPageActions = [
                buildAction({ id: "a1", userAccesses: [{ id: "user-1", name: "Test User", access: "r-------" }] }),
            ];

            const result = getPageActions(true, false, [], user, currentPageActions);

            expect(result).toEqual(["a1"]);
        });
    });

    describe("failure cases", () => {
        it("returns an empty array when user is falsy", () => {
            const result = getPageActions(false, false, [], undefined as unknown as User, []);

            expect(result).toEqual([]);
        });
    });
});
