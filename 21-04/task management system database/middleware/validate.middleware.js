const validate = (schema, property = "body") => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: error.details.map(err => err.message)
            });
        }

        if (property === "query") {
            req.validated = req.validated || {};
            req.validated[property] = value;
        } else {
            req[property] = value;
        }

        next();
    };
};

export { validate };