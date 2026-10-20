export const ROUTES = {
    home: "/",
    login: "/auth/login",
    register: "/auth/register",
    product: (id: string) => `/product/${id}`,
} as const;
