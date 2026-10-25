import { test, expect } from "@fixtures";
import { INVALID_CARD_CASES, PAYMENT_CASES, REQUIRED_ADDRESS_FIELDS, VALID_CARD } from "@data/checkout.data";
import { CheckoutMessage } from "@data/messages";
import { BillingAddress } from "@pages/checkout/address.step";
import { ApiPath } from "@config/routes";
import { PaymentMethod } from "@pages/checkout/payment.step";
import { CheckoutPage } from "@pages/checkout/checkout.page";
import { ToolshopApi } from "@api/toolshop.api";

/** Prices as the cart shows them ("$14.15") and as the invoice shows them ("$ 14.15"). */
const cartPrice = (amount: number) => `$${amount.toFixed(2)}`;
const invoicePrice = (amount: number) => `$ ${amount.toFixed(2)}`;

/** What the API answers when city/state don't match the postcode (see AddressMatchesCountry in the Toolshop API). */
const ADDRESS_MISMATCH_ERROR =
    "The billing_country does not match the entered address. The city does not belong to the selected country.";

/**
 * Step 3 first shows the profile address, then the postcode lookup (which can fire more than once)
 * overwrites street/city/state. Wait until the form equals the lookup result before reading or
 * changing it, and return the final address.
 */
async function waitForAddressLookup(checkoutPage: CheckoutPage, api: ToolshopApi): Promise<BillingAddress> {
    const { country, postalCode } = await checkoutPage.address.values();
    const expected = await api.lookupPostcode(country, postalCode);
    await expect
        .poll(() => checkoutPage.address.values(), { message: "address pre-filled from the postcode lookup" })
        .toMatchObject({ street: expected.street, city: expected.city, state: expected.state });
    return checkoutPage.address.values();
}

/**
 * Checkout runs as the signed-in setup customer. Every test starts in a new browser context,
 * so it gets its own cart. Each test adds one in-stock product through the product page.
 */
test.describe("Checkout", () => {
    test.beforeEach(async ({ api, productDetailPage, checkoutPage }) => {
        const product = await api.findInStockProduct("hand-tools");
        await productDetailPage.goto(product.id);
        await productDetailPage.addToCart();
        await checkoutPage.goto();
    });

    test.describe("places an order", { tag: ["@regression"] }, () => {
        for (const payment of PAYMENT_CASES) {
            test(`paid by ${payment.title}`, async ({ api, checkoutPage, invoiceListPage, invoiceDetailPage }) => {
                const product = await api.findInStockProduct("hand-tools");

                await test.step("1. cart shows the product and its price", async () => {
                    await expect(checkoutPage.cart.productTitles).toHaveText([product.name]);
                    await expect(checkoutPage.cart.total).toHaveText(cartPrice(product.price));
                    await checkoutPage.cart.proceed();
                });

                await test.step("2. sign-in step is skipped for a signed-in customer", async () => {
                    await checkoutPage.continueAsSignedIn();
                });

                const address = await test.step("3. billing address matches the postcode lookup", async () => {
                    const form = await waitForAddressLookup(checkoutPage, api);
                    await checkoutPage.address.proceed();
                    return form;
                });

                await test.step(`4. payment by ${payment.title} is accepted`, async () => {
                    await checkoutPage.payment.choose(payment.details);
                    expect(await checkoutPage.payment.pay()).toBe(200);
                    await expect(checkoutPage.payment.successMessage).toHaveText(CheckoutMessage.PaymentSuccessful);
                });

                const invoice = await test.step("5. confirming creates an invoice", async () => {
                    const { status, invoiceId } = await checkoutPage.payment.confirm();
                    expect(status).toBe(201);
                    await expect(checkoutPage.orderConfirmation).toContainText(CheckoutMessage.OrderThanks);
                    return { id: invoiceId!, number: await checkoutPage.invoiceNumber() };
                });

                await test.step(`6. invoice ${invoice.number} is listed and shows the order`, async () => {
                    await invoiceListPage.goto();
                    await invoiceListPage.open(invoice.id);
                    await expect(invoiceDetailPage.invoiceNumber).toHaveValue(invoice.number);
                    await expect(invoiceDetailPage.total).toHaveValue(invoicePrice(product.price));
                    await expect(invoiceDetailPage.paymentMethod).toHaveValue(payment.label);
                    await expect(invoiceDetailPage.city).toHaveValue(address.city);
                    await expect(invoiceDetailPage.postalCode).toHaveValue(address.postalCode);
                });
            });
        }
    });

    test.describe("billing address", { tag: ["@regression", "@negative"] }, () => {
        for (const field of REQUIRED_ADDRESS_FIELDS) {
            test(`cannot continue without ${field}`, async ({ checkoutPage, api }) => {
                await checkoutPage.goToAddressStep();
                await waitForAddressLookup(checkoutPage, api);

                await checkoutPage.address.fill(field, "");

                await expect(checkoutPage.address.proceedButton).toBeDisabled();
            });
        }
    });

    test.describe("credit card validation", { tag: ["@regression", "@negative"] }, () => {
        for (const data of INVALID_CARD_CASES) {
            test(`rejects ${data.title}`, async ({ checkoutPage, page }) => {
                await checkoutPage.goToPaymentStep();
                const paymentChecks = checkoutPage.payment.trackPaymentChecks();

                await checkoutPage.payment.choose({ method: PaymentMethod.CreditCard, ...data.card });

                await expect(page.getByText(data.message)).toBeVisible();
                await expect(checkoutPage.payment.finishButton).toBeDisabled();
                expect(paymentChecks(), "an invalid card must not reach the server").toBe(0);
            });
        }

        test("blocks a card holder name with digits", async ({ checkoutPage }) => {
            await checkoutPage.goToPaymentStep();
            const paymentChecks = checkoutPage.payment.trackPaymentChecks();

            await checkoutPage.payment.choose({
                method: PaymentMethod.CreditCard,
                ...VALID_CARD,
                cardHolder: "Test 123",
            });

            await expect(checkoutPage.payment.finishButton).toBeDisabled();
            expect(paymentChecks()).toBe(0);
        });
    });

    test.describe("known bugs", { tag: ["@regression", "@negative", "@known-bug"] }, () => {
        test(
            "explains why a card holder name with digits is rejected",
            {
                annotation: {
                    type: "bug",
                    description: "Finish is disabled, but the red error box under the card holder field is empty.",
                },
            },
            async ({ checkoutPage, page }) => {
                test.fail(); // remove once the app shows the message

                await checkoutPage.goToPaymentStep();
                await checkoutPage.payment.choose({
                    method: PaymentMethod.CreditCard,
                    ...VALID_CARD,
                    cardHolder: "Test 123",
                });

                await expect(page.getByText(CheckoutMessage.InvalidCardHolder)).toBeVisible();
            },
        );

        test(
            "tells the customer when the server rejects the order",
            {
                annotation: {
                    type: "bug",
                    description:
                        "When POST /invoices fails (e.g. 422 because the city doesn't match the postcode), the UI " +
                        "shows no error and keeps saying 'Payment was successful'. The 422 is mocked so the test " +
                        "is deterministic and creates no invoice.",
                },
            },
            async ({ checkoutPage, page }) => {
                test.fail(); // remove once the app shows the error

                await page.route(`**${ApiPath.Invoices}`, (route) =>
                    route.fulfill({ status: 422, json: { billing_country: [ADDRESS_MISMATCH_ERROR] } }),
                );
                await checkoutPage.goToPaymentStep();
                await checkoutPage.payment.choose({ method: PaymentMethod.CashOnDelivery });
                expect(await checkoutPage.payment.pay()).toBe(200);

                expect((await checkoutPage.payment.confirm()).status).toBe(422);
                await expect(checkoutPage.orderConfirmation).toBeHidden();
                await expect(page.getByText(CheckoutMessage.AddressMismatch)).toBeVisible();
            },
        );
    });
});
