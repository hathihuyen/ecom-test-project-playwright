import { Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { ROUTES } from "@config/routes";

/** `data-test` ids of the invoice detail page. (The invoice list rows have none.) */
export enum InvoiceLocator {
    InvoiceNumber = "invoice-number",
    InvoiceDate = "invoice-date",
    Total = "total",
    Street = "street",
    PostalCode = "postal_code",
    City = "city",
    State = "state",
    Country = "country",
    PaymentMethod = "payment-method",
    Download = "download-invoice",
}

/** "My invoices": a table of the customer's orders. */
export class InvoiceListPage extends BasePage {
    async goto() {
        await this.page.goto(ROUTES.invoices);
    }

    /**
     * The "Details" link of one invoice. Rows have no `data-test` ids, and invoice numbers are not
     * unique (concurrent orders can get the same number), so the link is matched by the invoice id.
     */
    detailsLink(invoiceId: string): Locator {
        return this.page.locator(`a[href$="${ROUTES.invoices}/${invoiceId}"]`);
    }

    async open(invoiceId: string) {
        await this.detailsLink(invoiceId).click();
    }
}

/** One invoice: read-only inputs with the order's details. */
export class InvoiceDetailPage extends BasePage {
    readonly invoiceNumber: Locator;
    readonly total: Locator;
    readonly street: Locator;
    readonly postalCode: Locator;
    readonly city: Locator;
    readonly state: Locator;
    readonly country: Locator;
    readonly paymentMethod: Locator;

    constructor(page: Page) {
        super(page);
        this.invoiceNumber = page.getByTestId(InvoiceLocator.InvoiceNumber);
        this.total = page.getByTestId(InvoiceLocator.Total);
        this.street = page.getByTestId(InvoiceLocator.Street);
        this.postalCode = page.getByTestId(InvoiceLocator.PostalCode);
        this.city = page.getByTestId(InvoiceLocator.City);
        this.state = page.getByTestId(InvoiceLocator.State);
        this.country = page.getByTestId(InvoiceLocator.Country);
        this.paymentMethod = page.getByTestId(InvoiceLocator.PaymentMethod);
    }

    async goto(invoiceId: string) {
        await this.page.goto(`${ROUTES.invoices}/${invoiceId}`);
    }
}
