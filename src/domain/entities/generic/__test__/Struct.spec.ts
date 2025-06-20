import { Struct } from "../Struct";

class Person extends Struct<{ name: string; age: number }>() {
    description() {
        return `${this.name} has ${this.age} years`;
    }
}

const mary = new Person({ name: "Mary Cassatt", age: 54 });

describe("Struct", () => {
    it("should create a new instance with the correct attributes", () => {
        expect(mary.name).toBe("Mary Cassatt");
        expect(mary.age).toBe(54);
    });

    it("should return the correct description", () => {
        expect(mary.description()).toBe("Mary Cassatt has 54 years");
    });

    it("should return the correct attributes", () => {
        const attributes = mary._getAttributes();
        expect(attributes).toEqual({ name: "Mary Cassatt", age: 54 });
    });
});
