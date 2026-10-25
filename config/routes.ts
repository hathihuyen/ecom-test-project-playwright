export const ROUTES = {
    home: "/",
    login: "/auth/login",
    register: "/auth/register",
    product: (id: string) => `/product/${id}`,
} as const;

/** REST API endpoints the UI calls (used to wait for or count network requests). */
export enum ApiPath {
    Login = "/users/login",
    Register = "/users/register",
}
