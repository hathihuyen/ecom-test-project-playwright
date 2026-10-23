import { Category } from "@components/header.component";

/**
 * This is not being used right now. Keep this if we plan tests that need a specific product
 * by name. In this case, remember that product's stock isn't guaranteed.
 */
export const PRODUCTS = {
    combinationPliers: { name: "Combination Pliers", category: "hand-tools" as Category },
} as const;