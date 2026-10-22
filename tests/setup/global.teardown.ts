import fs from "fs";
import { test as teardown } from "../../fixtures";
import { AUTH_FILES } from "../../config/auth";
import { env } from "../../config/env";

teardown("delete setup customer", async ({ api }) => {
    if (!fs.existsSync(AUTH_FILES.customer1User)) return;
    const { id } = JSON.parse(fs.readFileSync(AUTH_FILES.customer1User, "utf-8"));
    const adminToken = await api.login(env.adminEmail, env.adminPassword);
    await api.deleteUser(id, adminToken);
});
