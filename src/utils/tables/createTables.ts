import { Pool } from 'pg';

const createTables = async(pool: Pool) => {
    // Users
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE);
        `
    );

    // Coupons
    await pool.query(`
        CREATE TABLE IF NOT EXISTS coupons (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        max_uses INTEGER CHECK(max_uses > 0),
        used_times INTEGER CHECK(used_times >= 0) DEFAULT 0,
        max_discount_amount INTEGER CHECK(max_discount_amount > 0),
        discount_percent INTEGER CHECK (discount_percent > 0 AND discount_percent <= 100),
        expires_at TIMESTAMP DEFAULT NOW());
        `
    );

    // Carts
    await pool.query(`
        CREATE TABLE IF NOT EXISTS carts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        coupon_id INTEGER REFERENCES coupons(id));
        `
    );

    // Products
    await pool.query(`
        CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(20) NOT NULL,
        description VARCHAR(400),
        price INTEGER NOT NULL CHECK(price >= 0),
        category VARCHAR(20) NOT NULL,
        stock INTEGER NOT NULL CHECK(stock >= 0),
        image VARCHAR(60) NOT NULL,
        is_deleted BOOLEAN DEFAULT FALSE);
        `
    );

    // cart_items
    await pool.query(`
        CREATE TABLE IF NOT EXISTS cart_items(
        id SERIAL PRIMARY KEY,
        cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL CHECK(quantity > 0));
        `
    )
    
    // Status enum
    await pool.query(`DROP TYPE IF EXISTS status_enum CASCADE`)
    await pool.query(`CREATE TYPE status_enum AS ENUM ('pending', 'paid', 'sent', 'cancelled');`);

    // Orders
    await pool.query(`
        CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        total INTEGER NOT NULL CHECK(total >= 0),
        status status_enum NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW());
        `
    );

    // order_items
    await pool.query(`
        CREATE TABLE IF NOT EXISTS order_items(
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id),
        product_id INTEGER NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL CHECK(quantity > 0));
        `
    );

    // Reviews
    await pool.query(`
        CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) NOT NULL,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        rating INTEGER CHECK(rating BETWEEN 1 AND 5) NOT NULL,
        comment VARCHAR(500) NOT NULL);
        `
    );

    // coupons_users
    await pool.query(`
        CREATE TABLE IF NOT EXISTS coupons_users (
        id SERIAL PRIMARY KEY,
        coupon_id INTEGER REFERENCES coupons(id),
        user_id INTEGER REFERENCES users(id))
        `
    );

    console.log('Tables created successfully');
}

export default createTables;