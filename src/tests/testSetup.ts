import dotenv from "dotenv";
import resetDB from '../utils/tables/resetDB';
import createTables from "../utils/tables/createTables";
import { Pool } from 'pg';

dotenv.config();
export let pool: Pool;

beforeAll(async () => {
    pool = new Pool({
        user: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
        database: process.env.PG_DATABASE,
        host: process.env.PG_HOST,
        port: Number (process.env.PG_PORT),
    });

    await resetDB(pool);
    await createTables(pool);
});

afterAll(async () => {
    await pool.end();
});