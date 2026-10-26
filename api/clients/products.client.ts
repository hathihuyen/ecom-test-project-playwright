import { ApiPath } from "@config/routes";
import { ApiClient } from "./api-client";

export class ProductsClient extends ApiClient {
    list(params: { page?: number; by_category_slug?: string } = {}) {
        return this.request.get(this.url(ApiPath.Products), { params, headers: this.headers() });
    }

    get(productId: string) {
        return this.request.get(this.url(`${ApiPath.Products}/${productId}`), { headers: this.headers() });
    }

    search(query: string) {
        return this.request.get(this.url(ApiPath.ProductSearch), { params: { q: query }, headers: this.headers() });
    }
}
