// @ts-check
import { defineConfig } from "eslint/config";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import playwright from "eslint-plugin-playwright";
import prettier from "eslint-config-prettier";

export default defineConfig(
    { ignores: ["node_modules/", "playwright-report/", "test-results/", "blob-report/", ".auth/"] },

    eslint.configs.recommended,
    tseslint.configs.recommended,

    // Type-aware rules: catch a missing `await` on Playwright calls (the #1 cause of flaky tests)
    {
        files: ["**/*.ts"],
        languageOptions: {
            parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
        },
        rules: {
            "@typescript-eslint/no-floating-promises": "error",
            "@typescript-eslint/await-thenable": "error",
            "@typescript-eslint/no-misused-promises": "error",
        },
    },

    // Playwright best-practice rules, for tests only
    {
        files: ["tests/**/*.ts"],
        extends: [playwright.configs["flat/recommended"]],
        rules: {
            "playwright/expect-expect": ["warn", { assertFunctionNames: ["loginAs"] }],
        },
    },

    // Setup/teardown files prepare data rather than test behaviour
    {
        files: ["tests/setup/**/*.ts"],
        rules: { "playwright/expect-expect": "off", "playwright/no-conditional-in-test": "off" },
    },

    // Must stay last: turns off rules that would fight with Prettier
    prettier,
);
