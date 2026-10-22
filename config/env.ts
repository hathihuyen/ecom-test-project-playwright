import dotenv from "dotenv";
import path from "path";

// TEST_ENV=staging loads .env.staging first; values already set (e.g. by CI) always win.
if (process.env.TEST_ENV) {
    dotenv.config({ path: path.resolve(__dirname, `../.env.${process.env.TEST_ENV}`), quiet: true });
}
dotenv.config({ path: path.resolve(__dirname, "../.env"), quiet: true });

function required(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing environment variable "${name}". Add it to .env (see .env.example) or to the CI secrets.`);
    }
    return value;
}

export const env = {
    baseUrl: process.env.BASE_URL || "https://practicesoftwaretesting.com",
    apiUrl: process.env.API_URL || "https://api.practicesoftwaretesting.com",
    // Getters: only throw when a test actually needs the value
    get adminEmail() { return required("ADMIN_EMAIL"); },
    get adminPassword() { return required("ADMIN_PASSWORD"); },
};
