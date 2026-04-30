import mongoose from "mongoose";

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_DB_URI)
        .then(() => console.log("Database Connected"))
        .catch((error) => console.log("Database connection error : " + error));
}

export default connectDB;