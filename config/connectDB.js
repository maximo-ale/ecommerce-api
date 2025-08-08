require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async() => {
    try {
        mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
    } catch (err) {
        console.error('Error while connecting to DB: ', err);
        process.exit(1);
    }
}

module.exports = connectDB;