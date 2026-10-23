import fs from "fs";
import { test as teardown } from "@fixtures";
import { AUTH_FILES } from "@config/auth";
import { env } from "@config/env";

/**
 * Teardown only tidies up. When it fails, the run is marked failed even though
 * every real test might have passed. And when the database has just been rebuilt, the user it wants
 * to delete no longer exists anyway. => Don't let cleanup failures fail the whole run.
 */
teardown("delete setup customer", async ({ api }) => {
    if (!fs.existsSync(AUTH_FILES.customer1User)) return;
    const { id } = JSON.parse(fs.readFileSync(AUTH_FILES.customer1User, "utf-8"));

    try {
        const adminToken = await api.login(env.adminEmail, env.adminPassword);
        await api.deleteUser(id, adminToken);
    } catch (error) {
        // Cleanup is best-effort: the demo DB may be resetting, which removes the user anyway
        console.warn(`Teardown: could not delete setup customer ${id}: ${(error as Error).message}`);
    }
});
