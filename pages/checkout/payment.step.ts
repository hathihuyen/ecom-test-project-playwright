import { Locator, Page, Request } from "@playwright/test";
import { ApiPath } from "@config/routes";

/** `data-test` ids of checkout step 4 (payment). */
export enum PaymentLocator {
    Method = "payment-method",
    BankName = "bank_name",
    AccountName = "account_name",
    AccountNumber = "account_number",
    CardNumber = "credit_card_number",
    ExpirationDate = "expiration_date",
    Cvv = "cvv",
    CardHolder = "card_holder_name",
    MonthlyInstallments = "monthly_installments",
    GiftCardNumber = "gift_card_number",
    GiftCardCode = "validation_code",
    SuccessMessage = "payment-success-message",
    Finish = "finish",
}

/** Option values of the payment-method dropdown. */
export enum PaymentMethod {
    BankTransfer = "bank-transfer",
    CashOnDelivery = "cash-on-delivery",
    CreditCard = "credit-card",
    BuyNowPayLater = "buy-now-pay-later",
    GiftCard = "gift-card",
}

export type CreditCard = { cardNumber: string; expirationDate: string; cvv: string; cardHolder: string };

/** What the customer enters for each payment method. */
export type PaymentDetails =
    | { method: PaymentMethod.CashOnDelivery }
    | ({ method: PaymentMethod.CreditCard } & CreditCard)
    | { method: PaymentMethod.BankTransfer; bankName: string; accountName: string; accountNumber: string }
    | { method: PaymentMethod.BuyNowPayLater; installments: "3" | "6" | "9" | "12" }
    | { method: PaymentMethod.GiftCard; giftCardNumber: string; validationCode: string };

const isCall = (path: ApiPath) => (request: Request) =>
    request.method() === "POST" && new URL(request.url()).pathname === path;

export class PaymentStep {
    readonly methodSelect: Locator;
    readonly finishButton: Locator;
    readonly successMessage: Locator;

    constructor(private readonly page: Page) {
        this.methodSelect = page.getByTestId(PaymentLocator.Method);
        this.finishButton = page.getByTestId(PaymentLocator.Finish);
        this.successMessage = page.getByTestId(PaymentLocator.SuccessMessage);
    }

    /** Select the method and fill in its fields. */
    async choose(details: PaymentDetails) {
        await this.methodSelect.selectOption(details.method);
        switch (details.method) {
            case PaymentMethod.CreditCard:
                await this.fillCard(details);
                break;
            case PaymentMethod.BankTransfer:
                await this.page.getByTestId(PaymentLocator.BankName).fill(details.bankName);
                await this.page.getByTestId(PaymentLocator.AccountName).fill(details.accountName);
                await this.page.getByTestId(PaymentLocator.AccountNumber).fill(details.accountNumber);
                break;
            case PaymentMethod.BuyNowPayLater:
                await this.page.getByTestId(PaymentLocator.MonthlyInstallments).selectOption(details.installments);
                break;
            case PaymentMethod.GiftCard:
                await this.page.getByTestId(PaymentLocator.GiftCardNumber).fill(details.giftCardNumber);
                await this.page.getByTestId(PaymentLocator.GiftCardCode).fill(details.validationCode);
                break;
        }
    }

    async fillCard(card: CreditCard) {
        await this.page.getByTestId(PaymentLocator.CardNumber).fill(card.cardNumber);
        await this.page.getByTestId(PaymentLocator.ExpirationDate).fill(card.expirationDate);
        await this.page.getByTestId(PaymentLocator.Cvv).fill(card.cvv);
        await this.page.getByTestId(PaymentLocator.CardHolder).fill(card.cardHolder);
        await this.page.getByTestId(PaymentLocator.CardHolder).blur();
    }

    /** First "Finish": validates the payment. Returns the status of POST /payment/check. */
    async pay(): Promise<number> {
        const response = this.page.waitForResponse((r) => isCall(ApiPath.PaymentCheck)(r.request()));
        await this.finishButton.click();
        return (await response).status();
    }

    /** Second "Finish": places the order. Returns the status of POST /invoices and the new invoice's id. */
    async confirm(): Promise<{ status: number; invoiceId?: string }> {
        const responsePromise = this.page.waitForResponse((r) => isCall(ApiPath.Invoices)(r.request()));
        await this.finishButton.click();
        const response = await responsePromise;
        const body = response.ok() ? await response.json() : {};
        return { status: response.status(), invoiceId: body.id };
    }

    /** Counts POST /payment/check calls from now on. */
    trackPaymentChecks(): () => number {
        let count = 0;
        this.page.on("request", (request) => {
            if (isCall(ApiPath.PaymentCheck)(request)) count++;
        });
        return () => count;
    }
}
