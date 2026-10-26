import { APIRequestContext } from "@playwright/test";
import { env } from "@config/env";

/**
 * Base for the thin endpoint clients. Clients only build requests and return the raw
 * `APIResponse`: status codes, headers and bodies are asserted by the tests, never here.
 */
export abstract class ApiClient {
    constructor(protected readonly request: APIRequestContext) {}

    protected url(path: string): string {
        return `${env.apiUrl}${path}`;
    }

    protected headers(token?: string): Record<string, string> {
        return token
            ? { Accept: "application/json", Authorization: `Bearer ${token}` }
            : { Accept: "application/json" };
    }
}
