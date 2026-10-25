import { LoginField, SubmitMethod } from "@pages/login.page";
import { User } from "@models/user";
import { LoginMessage } from "./messages";

/** The Toolshop locks an account after this many wrong passwords in a row. */
export const MAX_FAILED_LOGIN_ATTEMPTS = 3;

/** Input the form rejects itself: error under the field, no API call. */
export interface InvalidInputCase {
    title: string;
    email: string;
    password: string;
    errors: { field: LoginField; message: LoginMessage }[];
}

/** Credentials built from a freshly registered user, so each case gets its own account. */
export interface CredentialCase {
    title: string;
    email: (user: User) => string;
    password: (user: User) => string;
    submitWith?: SubmitMethod;
}

export const INVALID_INPUT_CASES: InvalidInputCase[] = [
    {
        title: "empty email and password",
        email: "",
        password: "",
        errors: [
            { field: LoginField.Email, message: LoginMessage.EmailRequired },
            { field: LoginField.Password, message: LoginMessage.PasswordRequired },
        ],
    },
    {
        title: "empty email",
        email: "",
        password: "Valid#Pass1",
        errors: [{ field: LoginField.Email, message: LoginMessage.EmailRequired }],
    },
    {
        title: "empty password",
        email: "someone@example.com",
        password: "",
        errors: [{ field: LoginField.Password, message: LoginMessage.PasswordRequired }],
    },
    {
        title: "email without @ and domain",
        email: "not-an-email",
        password: "Valid#Pass1",
        errors: [{ field: LoginField.Email, message: LoginMessage.EmailFormatInvalid }],
    },
    {
        title: "SQL injection in email",
        email: "' OR '1'='1",
        password: "' OR '1'='1",
        errors: [{ field: LoginField.Email, message: LoginMessage.EmailFormatInvalid }],
    },
    {
        title: "email longer than 254 characters",
        email: `${"a".repeat(250)}@example.com`,
        password: "Valid#Pass1",
        errors: [{ field: LoginField.Email, message: LoginMessage.EmailFormatInvalid }],
    },
    {
        title: "password of 1 character",
        email: "someone@example.com",
        password: "x",
        errors: [{ field: LoginField.Password, message: LoginMessage.PasswordLengthInvalid }],
    },
    {
        title: "password of 2 characters (one below minimum)",
        email: "someone@example.com",
        password: "xy",
        errors: [{ field: LoginField.Password, message: LoginMessage.PasswordLengthInvalid }],
    },
];

/** The API rejects these with 401 and the same generic message (no hint whether the email exists). */
export const REJECTED_CREDENTIAL_CASES: CredentialCase[] = [
    { title: "unknown email", email: (u) => `unknown.${u.email}`, password: (u) => u.password },
    { title: "wrong password", email: (u) => u.email, password: () => "Wrong#Pass1" },
    { title: "password in wrong letter case", email: (u) => u.email, password: (u) => u.password.toUpperCase() },
    { title: "wrong password at minimum length (3 characters)", email: (u) => u.email, password: () => "abc" },
];

/** Unusual but valid ways to log in that must succeed. */
export const ACCEPTED_VARIANT_CASES: CredentialCase[] = [
    { title: "email in upper case", email: (u) => u.email.toUpperCase(), password: (u) => u.password },
    { title: "email with surrounding spaces", email: (u) => `  ${u.email}  `, password: (u) => u.password },
    {
        title: "the Enter key instead of the button",
        email: (u) => u.email,
        password: (u) => u.password,
        submitWith: SubmitMethod.EnterKey,
    },
];
