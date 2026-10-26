export const ROUTES = {
    home: "/",
    login: "/auth/login",
    register: "/auth/register",
    product: (id: string) => `/product/${id}`,
    checkout: "/checkout",
    invoices: "/account/invoices",
} as const;

/** REST API endpoints the UI calls (used to wait for or count network requests). */
export enum ApiPath {
    Login = "/users/login",
    Register = "/users/register",
    PaymentCheck = "/payment/check",
    Invoices = "/invoices",
    PostcodeLookup = "/postcode-lookup",
    Me = "/users/me",
    Users = "/users",
    Products = "/products",
    ProductSearch = "/products/search",
    Carts = "/carts",
}
