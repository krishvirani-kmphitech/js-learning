import 'dotenv/config';

import express from "express";
import mongoose from "mongoose";
import cookieParser from 'cookie-parser';

import { cronJob } from './services/cronJob.services.js';

import connectDB from './config/db.js';
import { routeNotFound, globalErrorHandler } from './utils/errorHandler.js';

import userRoute from "./routers/auth.router.js";
import flightRoute from "./routers/flight.router.js";
import bookingRoute from "./routers/booking.router.js";

const app = express();

// CRON JOBS
cronJob();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API routes
app.use("/auth", userRoute);
app.use("/flight", flightRoute);
app.use("/booking", bookingRoute);

app.get("/", (req, res) => {
    res.send("Server is running1");
});

// route not found
app.use(routeNotFound());
// globle error handler
app.use(globalErrorHandler());

// database connection
await connectDB();

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log("server run at 8000");
});