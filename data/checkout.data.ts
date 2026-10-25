import { AddressField } from "@pages/checkout/address.step";
import { CreditCard, PaymentDetails, PaymentMethod } from "@pages/checkout/payment.step";
import { CheckoutMessage } from "./messages";

/** A card in the format the Toolshop accepts (any number in this format is "approved"). */
export const VALID_CARD: CreditCard = {
    cardNumber: "0000-0000-0000-0000",
    expirationDate: "12/2030",
    cvv: "123",
    cardHolder: "Test Customer",
};

/** One successful order per payment method; `label` is how the invoice shows the method. */
export const PAYMENT_CASES: { title: string; label: string; details: PaymentDetails }[] = [
    { title: "cash on delivery", label: "Cash on Delivery", details: { method: PaymentMethod.CashOnDelivery } },
    {
        title: "credit card",
        label: "Credit Card",
        details: { method: PaymentMethod.CreditCard, ...VALID_CARD },
    },
    {
        title: "bank transfer",
        label: "Bank Transfer",
        details: {
            method: PaymentMethod.BankTransfer,
            bankName: "Test Bank",
            accountName: "Test Customer",
            accountNumber: "12345678",
        },
    },
    {
        title: "buy now pay later (3 months)",
        label: "Buy Now Pay Later",
        details: { method: PaymentMethod.BuyNowPayLater, installments: "3" },
    },
    {
        title: "gift card",
        label: "Gift Card",
        details: { method: PaymentMethod.GiftCard, giftCardNumber: "ABCD1234EFGH5678", validationCode: "AB12" },
    },
];

/** Card input the form must reject before anything is sent to the server. */
export const INVALID_CARD_CASES: { title: string; card: CreditCard; message: CheckoutMessage }[] = [
    {
        title: "card number without hyphens",
        card: { ...VALID_CARD, cardNumber: "0000000000000000" },
        message: CheckoutMessage.InvalidCardNumber,
    },
    {
        title: "expiry date in the past",
        card: { ...VALID_CARD, expirationDate: "01/2020" },
        message: CheckoutMessage.ExpiryInPast,
    },
    {
        title: "expiry date in the wrong format",
        card: { ...VALID_CARD, expirationDate: "2030-12" },
        message: CheckoutMessage.InvalidExpiryFormat,
    },
    { title: "CVV of 2 digits", card: { ...VALID_CARD, cvv: "12" }, message: CheckoutMessage.InvalidCvv },
];

/** Every address field is required: clearing any one of them blocks the step. */
export const REQUIRED_ADDRESS_FIELDS: AddressField[] = [
    AddressField.PostalCode,
    AddressField.HouseNumber,
    AddressField.Street,
    AddressField.City,
    AddressField.State,
];
