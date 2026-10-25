import { Locator, Page, expect } from "@playwright/test";

/** `data-test` ids of checkout step 3 (billing address). */
export enum AddressLocator {
    Country = "country",
    PostalCode = "postal_code",
    HouseNumber = "house_number",
    Street = "street",
    City = "city",
    State = "state",
    Proceed = "proceed-3",
}

/** Address fields the customer types into (country is a dropdown). */
export enum AddressField {
    PostalCode = AddressLocator.PostalCode,
    HouseNumber = AddressLocator.HouseNumber,
    Street = AddressLocator.Street,
    City = AddressLocator.City,
    State = AddressLocator.State,
}

export type BillingAddress = {
    country: string;
    postalCode: string;
    houseNumber: string;
    street: string;
    city: string;
    state: string;
};

export class AddressStep {
    readonly proceedButton: Locator;

    constructor(private readonly page: Page) {
        this.proceedButton = page.getByTestId(AddressLocator.Proceed);
    }

    field(field: AddressField | AddressLocator): Locator {
        return this.page.getByTestId(field);
    }

    /** The address currently in the form (pre-filled from the customer's profile and the postcode lookup). */
    async values(): Promise<BillingAddress> {
        // The form fills itself in asynchronously from the postcode lookup
        await expect(this.field(AddressLocator.City)).not.toHaveValue("");
        return {
            country: await this.field(AddressLocator.Country).inputValue(),
            postalCode: await this.field(AddressLocator.PostalCode).inputValue(),
            houseNumber: await this.field(AddressLocator.HouseNumber).inputValue(),
            street: await this.field(AddressLocator.Street).inputValue(),
            city: await this.field(AddressLocator.City).inputValue(),
            state: await this.field(AddressLocator.State).inputValue(),
        };
    }

    async fill(field: AddressField, value: string) {
        await this.field(field).fill(value);
    }

    async proceed() {
        await this.proceedButton.click();
    }
}
