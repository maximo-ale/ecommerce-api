import { Pool } from 'pg';

const resetDB = async(pool: Pool) => {
    await pool.query(`DROP TABLE IF EXISTS users CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS carts CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS cart_items CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS products CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS orders CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS order_items CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS reviews CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS coupons CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS coupons_users CASCADE`);
}

export default resetDB;