import pool from '../../config/connectDB';
import { Product } from '../product/productTypes';
import { CreateOrder, Order, OrderStatus } from './orderTypes';

class OrderRepository{
    async createOrder(data: CreateOrder): Promise<Order>{
        const { user, items, total, createdAt, status} = data;
        let fields: string[] = [];
        let values = [];
        let idx = 2;

        await pool.query(`BEGIN`);
        try {
            // Create a new order
            const result = await pool.query(`
                WITH new_order AS (
                    INSERT INTO orders (user_id, total, created_at, status)
                    VALUES ($1, $2, $3, $4)
                    RETURNING *
                )
                SELECT no.id AS order_id, no.total, no.created_at, no.status,
                       u.id AS user_id, u.name AS user_name
                FROM new_order no
                JOIN users u ON no.user_id = u.id;
            `, [user, total, createdAt, status]);

            const orderRow = result.rows[0];

            const order: Order = {
                id: orderRow.order_id,
                user: {
                    id: orderRow.user_id,
                    name: orderRow.user_name,
                },
                items: [],
                total: orderRow.total,
                createdAt: orderRow.created_at,
                status: orderRow.status,
            }

            for (const item of items){
                fields.push(`($1, $${idx}, $${idx + 1})`);
                values.push(item.product.id);
                values.push(item.quantity);
                idx += 2;
            }

            // Add all the relations between items and the new order to the table 'order_items'
            const orderItemsResult = await pool.query(`
                WITH new_order_item AS (
                    INSERT INTO order_items (order_id, product_id, quantity)
                    VALUES ${fields.join(', ')}
                    RETURNING product_id, quantity
                )
                SELECT p.name AS product_name, p.description, p.category, p.price, p.stock, p.image,
                       noi.product_id, noi.quantity
                FROM new_order_item noi
                JOIN products p ON noi.product_id = p.id
            `, [order.id, ...values]);

            order.items = orderItemsResult.rows.map(item => ({
                product: {
                    id: item.product_id,
                    name: item.product_name,
                    description: item.description,
                    category: item.category,
                    price: item.price,
                    stock: item.stock,
                    image: item.image,
                },
                quantity: item.quantity,
            }));

            await pool.query(`COMMIT`);

            return order;
        } catch (err) {
            await pool.query(`ROLLBACK`);
            console.error(err);

            throw new Error();
        }    
    }

    async updateStatus(orderId: string, status: string): Promise<OrderStatus>{
        const result = await pool.query(`
            UPDATE orders
            SET status = $2
            WHERE id = $1
            RETURNING id, status
        `, [orderId, status]);

        const row = result.rows[0];

        return {
            id: row.id,
            status: row.status,
        }
    }

    async getUserOrders(userId: string): Promise<Order[]>{
        const result = await pool.query(`
            SELECT o.id AS order_id, o.total, o.status, o.created_at,
                   u.id AS user_id, u.name AS user_name
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE user_id = $1;
        `, [userId]);

        const orders: Order[] = result.rows.map((row) => ({
            id: row.order_id,
            user: {
                id: row.user_id,
                name: row.user_name
            },
            items: [],
            total: row.total,
            status: row.status,
            createdAt: row.created_at
        }));

        const orderIds = result.rows.map(o => o.id);

        const itemsResult = await pool.query(`
            SELECT p.name AS product_name, p.description, p.category, p.price, p.stock, p.image,
                   oi.order_id, oi.product_id, oi.quantity
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ANY($1);
        `, [orderIds]);

        orders.forEach((order) => {
            order.items = itemsResult.rows
            .filter(item => item.order_id === order.id)
            .map(item => ({
                product: {
                    id: item.product_id,
                    name: item.product_name,
                    description: item.description,
                    category: item.category,
                    price: item.price,
                    stock: item.stock,
                    image: item.image,
                },
                quantity: item.quantity
            }));
        });

        return orders;
    }

    async findOrder(userId: string, orderId: string): Promise<Order | null>{
        const orderResult = await pool.query(`
            SELECT o.id AS order_id, o.total, o.created_at, o.status,
                   u.id AS user_id, u.name AS user_name
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE user_id = $1 AND o.id = $2;    
        `, [userId, orderId]);

        const orderRow = orderResult.rows[0];

        if (!orderRow) return null;
        
        const order: Order = {
            id: orderRow.order_id,
            user: {
                id: orderRow.user_id,
                name: orderRow.user_name,
            },
            items: [],
            total: orderRow.total,
            createdAt: orderRow.created_at,
            status: orderRow.status,
        }

        const itemsResult = await pool.query(`
            SELECT oi.product_id, oi.quantity,
                   p.name AS product_name, p.description, p.category, p.price, p.stock, p.image
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = $1;
        `, [orderRow.order_id]);

        order.items = itemsResult.rows.map(item => ({
            product: {
                id: item.product_id,
                name: item.product_name,
                description: item.description,
                category: item.category,
                price: item.price,
                stock: item.stock,
                image: item.image,
            },
            quantity: item.quantity
        }));

        return order;
    }

    // Return whether a user has bought a product
    async getBoughtProduct(userId: string, productId: string): Promise<boolean>{
        const result = await pool.query(`
            SELECT 1
            FROM orders o
            JOIN order_items oi ON oi.order_id = o.id
            WHERE o.user_id = $1 AND oi.product_id = $2
        `, [userId, productId]);

        return result.rows.length > 0;
    }
    async getAllOrders(): Promise<Order[]>{
        const result = await pool.query(`
            SELECT o.id AS order_id, o.total, o.status, o.created_at,
                   u.id AS user_id, u.name AS user_name
            FROM orders o
            JOIN users u ON o.user_id = u.id
        `);

        const orders: Order[] = result.rows.map((row) => ({
            id: row.order_id,
            user: {
                id: row.user_id,
                name: row.user_name
            },
            items: [],
            total: row.total,
            status: row.status,
            createdAt: row.created_at
        }));

        const orderIds = result.rows.map(o => o.id);

        const itemsResult = await pool.query(`
            SELECT p.name AS product_name, p.description, p.category, p.price, p.stock, p.image,
                   oi.order_id, oi.product_id, oi.quantity
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ANY($1);
        `, [orderIds]);

        // TODO: Optimize to avoid O(n^2)
        orders.forEach((order) => {
            order.items = itemsResult.rows
            .filter(item => item.order_id === order.id)
            .map(item => ({
                product: {
                    id: item.product_id,
                    name: item.product_name,
                    description: item.description,
                    category: item.category,
                    price: item.price,
                    stock: item.stock,
                    image: item.image,
                },
                quantity: item.quantity
            }));
        });

        return orders;
    }
}

export default new OrderRepository();