const SUCCESS_MSG = {
    OTP_RESEND: "OTP resend successfully",
    OTP_GENERATED: "OTP generated successfully",

    ACCOUNT_CREATE: "Account created and otp generated",

    USER_VERIFY: "User verify successfully",
    USER_DELETED: "User deleted successfully",
    USER_FOUND: "User data found successfully",

    LOGIN_SUCCESS: "Login successfully done",
    LOGOUT_SUCCESS: "Logout successfully done",
    PASSWORD_RESET: "Password reset successfully",

    ALL_COMPANY_FETCH: "All company data fetch successfully",
    ALL_COMPANY_USER_FETCH: "All company user data fetch successfully",
    COMPANY_FETCH: "Company data fetch successfully",
    GUARD_FETCH: "Guard data fetch successfully"

}

const ERROR_MSG = {
    INVALID_CREDENTIALS: "Email or password are wrong",
    INVALID_COMPANY: "Company not exist or not found",
    INVALID_USER_TYPE: "Invalid UserType",
    HAVE_NOT_PERMISSSION: "You have not permission to access this",

    EMAIL_ALREADY_USED: "Email already used by other user",

    USER_NOT_FOUND: "User not found",
    USER_NOT_VERIFY: "User not verified by otp",
    USER_TYPE_REQUIRED: "UserType is required",

    WAIT_FOR_OTP: "Please wait before requesting another OTP",
    TOO_MANY_RESEND_OTP: "OTP limit exceeded. Try again later",
    OTP_NOT_FOUND_OR_EXPIRE: "OTP not found or OTP is expired",
    TOO_MANY_OTP_ATTEMPT: "Too many attempts. OTP blocked",
    OTP_IS_WRONG: "OTP is incorrect",
    OTP_PROCESS_NOT_FOUND: "No active OTP process found",

    INVALID_TOKEN: "TOKEN is not valid",
    TOKEN_NOT_FOUND: "TOKEN not found",
    JWT_KEY_MISSING: "JWT Key is missing",

};


export {
    SUCCESS_MSG,
    ERROR_MSG
}