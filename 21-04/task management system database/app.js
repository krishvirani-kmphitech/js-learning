import 'dotenv/config';

import express from "express";
import mongoose from "mongoose";

import authRoute from "./routes/auth.route.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.use("/auth", authRoute);


await mongoose.connect(process.env.MONGO_DB_URI)
    .then(() => { console.log("DB connected") })
    .catch((error) => { console.log("DB error : " + error) });

app.listen(8000, () => {
    console.log("server run at 8000");
});