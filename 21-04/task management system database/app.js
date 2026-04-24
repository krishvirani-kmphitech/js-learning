import 'dotenv/config';

import express from "express";
import mongoose from "mongoose";
import cookieParser from 'cookie-parser';

import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.use("/auth", authRoute);
app.use("/user", userRoute);

app.use((req, res, next) => {

    return res.status(404).json({
        success: false,
        message: "Route not found"
    });

});

app.use((err, req, res, next) => {

    return res
        .status(err.statusCode || 500)
        .json({
            success: false,
            message: err.message || "Internal Server Error."
        });

});


await mongoose.connect(process.env.MONGO_DB_URI)
    .then(() => { console.log("DB connected") })
    .catch((error) => { console.log("DB error : " + error) });

app.listen(8000, () => {
    console.log("server run at 8000");
});