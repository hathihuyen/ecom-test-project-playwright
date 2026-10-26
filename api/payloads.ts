import { User } from "@models/user";

/** Request body of POST /users/register, built from the shared `User` model. */
export const toRegisterPayload = (user: User) => ({
    first_name: user.firstName,
    last_name: user.lastName,
    dob: user.dob,
    phone: user.phone,
    email: user.email,
    password: user.password,
    address: {
        street: user.streetAddress,
        house_number: user.houseNumber,
        city: user.city,
        state: user.state,
        country: user.country,
        postal_code: user.zip,
    },
});
