import { faker } from "@faker-js/faker";

/* If you’d like to set certain values yourself, the _overrides
parameter lets you do just that. For instance,
createUser({ email: 'specific@example.com' })
locks in that email address while Faker.js fills in the rest of the details for you
*/
export function createUser(_overrides = {}) {
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
        country: "United States of America (the)",
        phone: faker.string.numeric(10),
        dob: createDOB({ min: 18, max: 80}),
    };
}

/**
 * Create an array of user objects.
 * 
 * @param {number} count - Number of users to generate
 * @returns {Array<object>} Array of user objects
 */
export function createUsers(count: number): Array<object> {
    return Array.from({ length: count }, () => createUser());
}

export function createInvalidUser() {
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

export function createEdgeCaseUser() {
    return {
        ...createUser(),
        firstName: faker.string.alpha({ length: 50 }),
        email: `test+${faker.string.alphanumeric(100)}@test.com`,
    };
}