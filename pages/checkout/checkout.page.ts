import { Locator, Page } from "@playwright/test";
import { BasePage } from "../base.page";
import { ROUTES } from "@config/routes";
import { CartStep } from "./cart.step";
import { AddressStep } from "./address.step";
import { PaymentStep } from "./payment.step";

/** `data-test` ids of the checkout wizard itself. */
export enum CheckoutLocator {
    ProceedFromSignIn = "proceed-2",
}

/** The order confirmation has no `data-test` id, so it's found by its element id. */
export enum CheckoutSelector {
    OrderConfirmation = "#order-confirmation",
}

const INVOICE_NUMBER = /INV-\d+/;

/** The checkout wizard: one component per step, like the header on every page. */
export class CheckoutPage extends BasePage {
    readonly cart: CartStep;
    readonly address: AddressStep;
    readonly payment: PaymentStep;
    readonly orderConfirmation: Locator;

    constructor(page: Page) {
        super(page);
        this.cart = new CartStep(page);
        this.address = new AddressStep(page);
        this.payment = new PaymentStep(page);
        this.orderConfirmation = page.locator(CheckoutSelector.OrderConfirmation);
    }

    async goto() {
        await this.page.goto(ROUTES.checkout);
    }

    /** Step 2: the customer is already signed in, so just continue. */
    async continueAsSignedIn() {
        await this.page.getByTestId(CheckoutLocator.ProceedFromSignIn).click();
    }

    /** Cart → sign-in → address step (for tests that start at the address). */
    async goToAddressStep() {
        await this.cart.proceed();
        await this.continueAsSignedIn();
    }

    /** Cart → sign-in → address (as pre-filled) → payment step. */
    async goToPaymentStep() {
        await this.goToAddressStep();
        await this.address.proceed();
    }

    /** The `INV-…` number from the confirmation text. */
    async invoiceNumber(): Promise<string> {
        const text = await this.orderConfirmation.innerText();
        const match = text.match(INVOICE_NUMBER);
        if (!match) throw new Error(`No invoice number in confirmation: "${text}"`);
        return match[0];
    }
}
