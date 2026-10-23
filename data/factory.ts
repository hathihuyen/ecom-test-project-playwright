import { faker } from "@faker-js/faker";
import { User } from "@models/user";

/**
 * Build a valid user. Any field passed in `overrides` replaces the generated value,
 * If you’d like to set certain values yourself, the _overrides
 * parameter lets you do just that. For instance, createUser()
 * locks in that email address while Faker.js fills in the rest of the details for you
 * @param overrides 
 * @returns 
 */
export function createUser(overrides: Partial<User> = {}): User {
    return {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password({ length: 10, prefix: "#1Aa" }),
        houseNumber: faker.location.buildingNumber(),
        streetAddress: faker.location.street(),
        city: faker.location.city(),
        state: faker.location.state(),
        zip: faker.location.zipCode("#####"),
        // Toolshop requires specific countries
        country: "US", // option value; works for both the UI dropdown and the API
        phone: faker.string.numeric(10),
        dob: createDOB({ min: 18, max: 74 }), // API only accepts ages 18-75 (was 80 -> random failures)
        ...overrides, // <- this is the line that was missing before
    };
}

/**
 * Create an array of user objects.
 * 
 * @param {number} count - Number of users to generate
 * @returns {User[]} Array of user objects
 */
export function createUsers(count: number, overrides: Partial<User> = {}): User[] {
    return Array.from({ length: count }, () => createUser(overrides));
}

export function createInvalidUser(): Pick<User, "firstName" | "dob" | "password"> {
    return {
        firstName: "", // Empty name
        dob: "1900", // Invalid format
        password: "123", // Too short
    };
}

export function createDOB(ageRange: { min: number, max: number}) {
    return faker.date
    .birthdate({ min: ageRange.min, max: ageRange.max, mode: "age" })
    .toISOString()
    .split("T")[0];
}

export function createBoundaryUser(): User {
    return {
        ...createUser(),
        firstName: faker.string.alpha({ length: 40 }),
        lastName: faker.string.alpha({ length: 20 }),
    };
}