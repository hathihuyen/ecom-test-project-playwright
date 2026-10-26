import { APIResponse, expect as baseExpect } from "@playwright/test";
import { z } from "zod";

/** Playwright's `expect`, extended with `toMatchSchema` for API contract checks. */
export const expect = baseExpect.extend({
    toMatchSchema(received: unknown, schema: z.ZodType) {
        const result = schema.safeParse(received);
        return {
            name: "toMatchSchema",
            pass: result.success,
            message: () =>
                result.success
                    ? "Expected the body NOT to match the schema, but it did"
                    : `Response body breaks the contract:\n${z.prettifyError(result.error)}`,
        };
    },
});

/**
 * Assert status, JSON content type and schema in one call; returns the body typed by the schema.
 * The body text is included in the status message, so a wrong status shows what the API said.
 */
export async function expectResponse<T extends z.ZodType>(
    response: APIResponse,
    status: number,
    schema: T,
): Promise<z.infer<T>> {
    expect(response.status(), `${response.url()} → ${await response.text()}`).toBe(status);
    expect(response.headers()["content-type"]).toContain("application/json");
    const body: unknown = await response.json();
    expect(body).toMatchSchema(schema);
    return schema.parse(body);
}
