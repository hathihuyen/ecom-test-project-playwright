import { ApiPath } from "@config/routes";
import { ApiClient } from "./api-client";

export class UsersClient extends ApiClient {
    register(payload: object) {
        return this.request.post(this.url(ApiPath.Register), { data: payload, headers: this.headers() });
    }

    login(email: string, password: string) {
        return this.request.post(this.url(ApiPath.Login), { data: { email, password }, headers: this.headers() });
    }

    me(token?: string) {
        return this.request.get(this.url(ApiPath.Me), { headers: this.headers(token) });
    }

    list(token?: string) {
        return this.request.get(this.url(ApiPath.Users), { headers: this.headers(token) });
    }

    get(userId: string, token?: string) {
        return this.request.get(this.url(`${ApiPath.Users}/${userId}`), { headers: this.headers(token) });
    }

    delete(userId: string, token?: string) {
        return this.request.delete(this.url(`${ApiPath.Users}/${userId}`), { headers: this.headers(token) });
    }
}
