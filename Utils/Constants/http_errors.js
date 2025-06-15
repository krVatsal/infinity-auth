const HttpErrors = {
    // General errors
    GENERAL_ERROR: {
        status: 500,
        name: 'GeneralError',
        message: 'An error occurred. Please try again later.'
    },

    // Authentication errors
    AUTH_TOKEN_MISSING: {
        status: 401,
        name: 'AuthTokenMissing',
        message: 'Authorization token is missing.'
    },
    INVALID_TOKEN: {
        status: 401,
        name: 'InvalidToken',
        message: 'Invalid token.'
    },
    TOKEN_EXPIRED: {
        status: 403,
        name: 'TOKEN_EXPIRED',
        message: 'Auth token expired'
    },

    // User errors
    USER_NOT_FOUND: {
        status: 404,
        name: 'UserNotFound',
        message: 'User not found.'
    },
    ACCOUNT_SUSPENDED: {
        status: 404,
        name: 'AccountSuspended',
        message: 'Your account is no longer active.'
    },
    USER_ALREADY_EXISTS: {
        status: 400,
        name: 'UserAlreadyExists',
        message: 'User already exists.'
    },
    INVALID_CREDENTIALS: {
        status: 400,
        name: 'InvalidCredentials',
        message: 'Invalid email or password.'
    },
    URI_METHOD_INVALID: {
        status: 404,
        name: 'UriMethodInvalid',
        message: 'The Request URI or Method is not allowed'
    },
    PASSWORD_REQUIRED: {
        status: 400,
        name: 'PasswordRequired',
        message: 'Password is required.'
    },
    INVALID_OTP: {
        status: 400,
        name: 'InvalidOtp',
        message: 'Invalid OTP.'

    },
    INVALID_REQUEST:{
        status: 400,
        name: 'InvalidRequest',
        message: 'Invalid request.'
    },

    INVALID_INPUT: {
        status: 400,
        name: 'InvalidInput',
        message: 'Invalid input.'
    },
    MISSING_FIELDS: {
        status: 400,
        name: 'MissingFields',
        message: 'Please fill in all required fields.'
    },
    EMAIL_INVALID: {
        status: 400,
        name: 'InvalidEmail',
        message: 'Invalid email address.'
    },

    DB_ERROR: {
        status: 500,
        name: 'DatabaseError',
        message: 'Database error occurred.'
    },
    SERVER_ERROR: {
        status: 500,
        name: 'ServerError',
        message: 'Internal server error.'
    },
    INSUFFICIENT_PERMISSIONS: {
        status: 403,
        name: 'InsufficientPermissions',
        message: 'You do not have permission to perform this action.'
    }
};

module.exports = HttpErrors;
