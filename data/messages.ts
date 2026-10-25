/** Texts the Toolshop shows on the login page, exactly as the app renders them. */
export enum LoginMessage {
    EmailRequired = "Email is required",
    EmailFormatInvalid = "Email format is invalid",
    PasswordRequired = "Password is required",
    PasswordLengthInvalid = "Password length is invalid",
    InvalidCredentials = "Invalid email or password",
    AccountLocked = "Account locked, too many failed attempts. Please contact the administrator.",
}

/** Texts the Toolshop shows during checkout, exactly as the app renders them. */
export enum CheckoutMessage {
    PaymentSuccessful = "Payment was successful",
    OrderThanks = "Thanks for your order! Your invoice number is",
    InvalidCardNumber = "Invalid card number format.",
    InvalidExpiryFormat = "Invalid date format. Use MM/YYYY.",
    ExpiryInPast = "Expiration date must be in the future.",
    InvalidCvv = "CVV must be 3 or 4 digits.",
    /** The app's text for an invalid card holder name (currently not displayed: known bug). */
    InvalidCardHolder = "Only letters and spaces are allowed.",
    AddressMismatch = "does not match the entered address",
}
