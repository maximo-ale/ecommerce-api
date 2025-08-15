require('dotenv').config();
const resetDB = require('../utils/resetDB');
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        if (process.env.RESET_DB_ON_START?.toLowerCase === 'true'){
            await resetDB();
        }

        console.log('Connected to DB');
    } catch (err) {    
        console.error('Connection failed', err);
        process.exit(1);
    }
}

module.exports = connectDB;