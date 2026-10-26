import { ApiPath } from "@config/routes";
import { ApiClient } from "./api-client";

export class CartsClient extends ApiClient {
    create() {
        return this.request.post(this.url(ApiPath.Carts), { headers: this.headers() });
    }

    get(cartId: string) {
        return this.request.get(this.url(`${ApiPath.Carts}/${cartId}`), { headers: this.headers() });
    }

    addItem(cartId: string, productId: string, quantity: number) {
        return this.request.post(this.url(`${ApiPath.Carts}/${cartId}`), {
            data: { product_id: productId, quantity },
            headers: this.headers(),
        });
    }

    updateQuantity(cartId: string, productId: string, quantity: number) {
        return this.request.put(this.url(`${ApiPath.Carts}/${cartId}/product/quantity`), {
            data: { product_id: productId, quantity },
            headers: this.headers(),
        });
    }

    removeItem(cartId: string, productId: string) {
        return this.request.delete(this.url(`${ApiPath.Carts}/${cartId}/product/${productId}`), {
            headers: this.headers(),
        });
    }

    delete(cartId: string) {
        return this.request.delete(this.url(`${ApiPath.Carts}/${cartId}`), { headers: this.headers() });
    }
}
