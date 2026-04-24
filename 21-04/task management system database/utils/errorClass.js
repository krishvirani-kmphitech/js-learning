class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.success = false;
    }

    static badRequest(msg = "Bad Request") {
        return new ApiError(400, msg);
    }

    static unauthorized(msg = "Unauthorized") {
        return new ApiError(401, msg);
    }

    static forbidden(msg = "Forbidden") {
        return new ApiError(403, msg);
    }

    static notFound(msg = "Resource not found") {
        return new ApiError(404, msg);
    }

    static tooManyRequest(msg = "Resource not found") {
        return new ApiError(404, msg);
    }

    static internal(msg = "Internal Server Error") {
        return new ApiError(500, msg);
    }

}

export default ApiError;