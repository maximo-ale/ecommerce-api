import mongoose from "mongoose";
import dotenv from "dotenv";
import resetDB from "../utils/resetDB.js";

dotenv.config();

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    //await resetDB();
});

afterAll(async () => {
    await mongoose.disconnect();
});
