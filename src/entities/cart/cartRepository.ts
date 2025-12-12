import { AddProduct, Cart, CreateCart, Item, UpdateProductQuantity } from './cartTypes';
import { Coupon } from '../coupon/couponTypes';
import pool from '../../config/connectDB';

class CartRepository{
    async addProductToCart(productId: string, quantity: number, userCart: Cart): Promise<Cart>{
        const result = await pool.query(`
            INSERT INTO cart_items (product_id, quantity, cart_id)
            VALUES ($1, $2, $3)
            RETURNING product_id, quantity;
        `, [productId, quantity, userCart.id]);

        const item = result.rows[0];

        const productResult = await pool.query(`
            SELECT *
            FROM products
            WHERE id = $1;
        `, [productId]);

        const product = productResult.rows[0];

        const newItem: Item = {
            product: {
                id: product.id,
                name: product.name,
                description: product.description,
                category: product.category,
                price: product.price,
                stock: product.stock,
                image: product.image,
            },
            quantity: item.quantity,
        }

        return {
            ...userCart,
            items: [...userCart.items, newItem],
        }
    }

    async updateQuantity(productId: string, finalQuantity: number, userCart: Cart): Promise<Cart>{
        await pool.query(`
            UPDATE cart_items
            SET quantity = $2
            WHERE product_id = $1 AND cart_id = $3
            RETURNING *;
        `, [productId, finalQuantity, userCart.id]);

        const updatedItems = userCart.items.map((item) => 
            item.product.id === productId
            ? {...item, quantity: finalQuantity}
            : item
        );

        return {
            ...userCart,
            items: updatedItems,
        };
    }

    async getUserCart(userId: string): Promise<Cart | null>{

        // Get user cart without items
        const userCartResult = await pool.query(`
            SELECT c.id AS cart_id,
                   u.id AS user_id, u.name AS user_name,
                   co.id AS coupon_id, co.code, co.max_uses, co.used_times, co.max_discount_amount,
                   co.discount_percent, co.expires_at
            FROM carts c
            JOIN users u ON c.user_id = u.id
            LEFT JOIN coupons co ON c.coupon_id = co.id
            WHERE c.user_id = $1
            `, [userId]
        );

        const row = userCartResult.rows[0];
        if (!row) return null;

        const cart: Cart = {
            id: row.cart_id,
            user: {
                id: row.user_id,
                name: row.user_name,
            },
            items: [],
            coupon: {
                id: row.coupon_id,
                code: row.code,
                maxUses: row.max_uses,
                usedTimes: row.used_times,
                maxDiscountAmount: row.max_discount_amount,
                discountPercent: row.discount_percent,
                expiresAt: row.expires_at
            },
        }

        // Get items from the cart
        const itemsResult = await pool.query(`
            SELECT ci.id AS item_id, ci.quantity,
                   p.id AS product_id, p.name AS product_name, p.description, p.category, p.price, p.stock, p.image
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = $1;
        `, [row.cart_id]);

        cart.items = itemsResult.rows.map((row) => ({
            id: row.item_id,
            quantity: row.quantity,
            product: {
                id: row.product_id,
                name: row.product_name,
                description: row.description,
                category: row.category,
                price: row.price,
                stock: row.stock,
                image: row.image,
            }
        }));

        return cart;
    }

    async createNewCart(data: CreateCart): Promise<Cart>{
        const { userId, item, couponId = null } = data;
        await pool.query(`BEGIN`);
        try {
            const newCartResult = await pool.query(`
                WITH new_cart AS (
                    INSERT INTO carts (user_id, coupon_id)
                    VALUES ($1, $2)
                    RETURNING id, user_id
                )
                SELECT nc.id AS cart_id,
                       u.id AS user_id, u.name AS user_name
                FROM new_cart nc
                JOIN users u ON nc.user_id = u.id
            `, [userId, couponId]);

            const cartRow = newCartResult.rows[0];

            const cart: Cart = {
                id: cartRow.cart_id,
                user: {
                    id: cartRow.user_id,
                    name: cartRow.user_name,
                },
                items: []
            }

            if (item){
                const cartItemsResult = await pool.query(`
                    WITH new_cart_item AS (
                        INSERT INTO cart_items (cart_id, product_id, quantity)
                        VALUES ($1, $2, $3)
                        RETURNING id, product_id, quantity
                    )
                    SELECT nci.id AS item_id, nci.quantity,
                           p.id AS product_id, p.name, p.description, p.category, p.price, p.stock, p.image
                    FROM new_cart_item nci
                    JOIN products p ON nci.product_id = p.id
                `, [cartRow.cart_id, item.product.id, item.quantity]);

                cart.items = cartItemsResult.rows.map((row) => ({
                    id: row.item_id,
                    quantity: row.quantity,
                    product: {
                        id: row.product_id,
                        name: row.name,
                        description: row.description,
                        category: row.category,
                        price: row.price,
                        stock: row.stock,
                        image: row.image,
                    }
                }));
            }

            await pool.query(`COMMIT`);
            return cart;
        } catch (err) {
            await pool.query(`ROLLBACK`);
            console.error(err);
            throw new Error();
        }
    }

    async isProductInCart(productId: string, cart: Cart): Promise<boolean>{
        const result = await pool.query(`
            SELECT 1
            FROM cart_items
            WHERE product_id = $1 AND cart_id = $2;
        `, [productId, cart.id]);

        return result.rows.length > 0;
    }

    async removeProductFromCart(productId: string, userCart: Cart): Promise<Cart>{
        await pool.query(`
            DELETE FROM cart_items
            WHERE product_id = $1 AND cart_id = $2;  
        `, [productId, userCart.id]);

        const updatedItems = userCart.items.filter(item => item.product.id !== productId)

        return {...userCart, items: updatedItems};
    }
    
    async addCoupon(userCart: Cart, couponId: string): Promise<Coupon>{
        const result = await pool.query(`
            UPDATE carts
            SET coupon_id = $2
            WHERE id = $1
            RETURNING coupon_id;
        `, [userCart.id, couponId]);

        const cartCoupon = result.rows[0];

        const couponResult = await pool.query(`
            SELECT *
            FROM coupons
            WHERE id = $1;
        `, [cartCoupon.coupon_id]);

        return couponResult.rows[0];
    }

    async removeCoupon(userId: string): Promise<Coupon>{
        const result = await pool.query(`
            UPDATE carts
            SET coupon_id = $2
            WHERE user_id = $1
            RETURNING coupon_id;
        `, [userId, null]);

        const cartCoupon = result.rows[0];

        const couponResult = await pool.query(`
            SELECT *
            FROM coupons
            WHERE id = $1;
        `, [cartCoupon.id]);

        return couponResult.rows[0];
    }

    async clearCart(userCart: Cart){
        await pool.query(`
            DELETE FROM cart_items
            WHERE cart_id = $1
        `, [userCart.id]);
    }

    async deleteCart(userId: string){
        await pool.query(`
            DELETE FROM carts
            WHERE id = $1;    
        `, [userId]);
    }
}

export default new CartRepository();