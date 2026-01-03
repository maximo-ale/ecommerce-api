import pool from "../config/connectDB";

export const waitForDB = async(attempts: number = 20, delay: number = 3000) => {
    for (let i = 0; i < attempts; i++){
        try {
            await pool.query(`SELECT 1`);
            console.log('Successfully connected to DB on attempt ', i + 1);
            return;
        } catch {
            console.log(`Could not connect to DB on attempt ${i + 1}, trying again in ${delay/1000}s`);
        }
    }

    throw new Error('Failed to connect to DB');
}