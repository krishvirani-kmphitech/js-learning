import ApiResponse from "./responceClass.js";

const routeNotFound = () => {
    return (req, res, next) => {
        return res
            .status(404)
            .json(new ApiResponse(404, "Route not found"));
    }
}

const globalErrorHandler = () => {
    return (err, req, res, next) => {
        // console.error(err);
        return res
            .status(err.statusCode || 500)
            .json(new ApiResponse(err.statusCode || 500, err.message || "Internal Server Error"));
    }
}

export {
    routeNotFound,
    globalErrorHandler
};