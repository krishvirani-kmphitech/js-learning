class ApiResponse {
    constructor(statusCode, message, data = null) {
        this.success = statusCode < 400;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }
}

const sendResponse = (res, statusCode, message, data = null) => {
    return res
        .status(statusCode)
        .json(new ApiResponse(statusCode, message, data));
}

const sendSuccess = (res, message, data = null, statusCode = 200) => {
    return res
        .status(statusCode)
        .json(new ApiResponse(statusCode, message, data));
}

const sendCreated = (res, message, data = null, statusCode = 201) => {
    return res
        .status(statusCode)
        .json(new ApiResponse(statusCode, message, data));
}

export {
    sendResponse,
    sendSuccess,
    sendCreated
};