const SUCCESS_MSG = {

    OTP_SEND: "OTP send successfully",

    USER_CREATED: "User created successfully",

    LOGIN_SUCCESS: "Login successfully done",
    LOGOUT_SUCCESS: "Logout successfully done",

    FLIGHT_CREATED: "Flight successfully created",
    FLIGHT_DATA_FETCH: "Flight data fetch successfully",

    BOOKING_DATA_FETCH: "Your booking data fetch successfully",
    BOOKING_CREATED_CONFIRM_PAYMENT: "Booking order placed, now make payment to confirm your seats",
    BOOKING_CANCEL_SUCCESSFULLY: "Booking cancel successfully",
    BOOKING_NOT_FOUND: "Booking not found",
    PAYMENT_DONE_BOOKING_CONFIRM: "Payment done, your booking now confirm",

}

const ERROR_MSG = {

    INVALID_USER_CREDENTIALS: "User Email and password are wrong",

    TOKEN_NOT_FOUND: "Token not found",
    TOKEN_IS_INVALID: "Token is invalid",

    USER_NOT_FOUND: "User not found",
    USER_ALREADY_EXIST: "User already exist with this email",
    USER_ALREADY_VERIFIED: "User already verified OTP",

    OTP_NOT_FOUND: "OTP not found",
    OTP_NOT_GENERATE_OR_INVALID: "OTP not generate or invalid OTP",
    OTP_NOT_GENERATED: "OTP not generated",
    OTP_INVALID: "OTP is invalid",
    OTP_REQUEST_TOO_MANY: "Too many OTP request send. please wait some to request next OTP",
    OTP_IS_EXPIRE: "OTP is expired",
    OTP_ATTEMPT_TOO_MANY: "Too many wrong OTP attempt",

    FLIGHT_NOT_FOUND: "Flight not found",
    FLIGHT_SEATS_NOT_AVAILABLE: "Flight seats not available at this time. you can check seats after some time if any traveller cancel thier seat, then you can book",
    FLIGHT_ALREADY_STARTED: "Flight already started",
    FLIGHT_ALREADY_STARTED_OR_COMPLATED: "Flight is already started or complated",

    BOOKING_NOT_FOUND: "Booking not found",
    BOOKING_FOUND_IN_PENDING: "You can't booking flight seat beacuse your pending Booking found in this flight. please make payment to confirm this or cancel this booking for make new booking",
    BOOKING_IS_ALREADY_CANCEL: "Booking is already cancel or reject",

    NOT_PERMISSION: "You have not permission to access this",
    AMOUNT_NOT_MATCH: "Amount not match to you bill"

}

const STATUS_CODE = {
    OK: 200,
    CREATED: 201,

    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,

}

export {
    SUCCESS_MSG,
    ERROR_MSG,
    STATUS_CODE
}