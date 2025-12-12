import pool from '../../config/connectDB';
import { CreateReview, Review, UpdateReview } from './reviewTypes';

class ReviewRepository{
    async createReview(data: CreateReview, productId: string, userId: string): Promise<Review>{
        const { rating, comment} = data;
        const review = await pool.query(`
            INSERT INTO reviews (user_id, product_id, rating, comment)
            VALUES ($1, $2, $3, $4)
            RETURNING id, user_id
        `, [userId, productId, rating, comment]);
        const row = review.rows[0];

        return {
            id: row.id,
            user: row.user_id,
            product: row.product_id,
            comment: row.comment,
            rating: row.rating,
        }
    }

    async findById(reviewId: string): Promise<Review | null>{
        const review = await pool.query(`
            SELECT r.id AS review_id, r.comment, r.rating,
                   u.id AS user_id, u.name AS user_name,
                   p.id AS product_id, p.name AS product_name, p.category, p.price, p.stock
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN products p ON r.product_id = p.id
            WHERE r.id = $1;
        `, [reviewId]);

        const row = review.rows[0];

        if (!row){
            return null;
        }

        return {
            id: row.review_id,
            comment: row.comment,
            rating: row.rating,
            user: {
                id: row.user_id,
                name: row.user_name,
            },
            product: {
                id: row.product_id,
                name: row.product_name,
                category: row.category,
                price: row.price,
                stock: row.stock,
            }
        }
    }

    async findUserReview(userId: string, productId: string): Promise<Review | null>{
        const userReview = await pool.query(`
            SELECT r.id AS review_id, r.comment, r.rating,
                   u.id AS user_id, u.name AS user_name,
                   p.id AS product_id, p.name AS product_name, p.category, p.price, p.stock
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN products p ON r.product_id = p.id
            WHERE r.user_id = $1 AND r.product_id = $2
            `, [userId, productId]
        );

        const row = userReview.rows[0];
        if (!row) return null;
        return {
            id: row.review_id,
            comment: row.comment,
            rating: row.rating,
            user: {
                id: row.user_id,
                name: row.user_name,
            },
            product: {
                id: row.product_id,
                name: row.product_name,
                category: row.category,
                price: row.price,
                stock: row.stock,
            }
        }
    }

    async getProductReviews(productId: string): Promise<Review[]>{
        const productReviews = await pool.query(`
            SELECT *
            FROM reviews
            WHERE product_id = $1; 
            `, [productId]
        );

        return productReviews.rows;
    }

    async getUserReviews(userId: string): Promise<Review[]>{
        const userReviews = await pool.query(`
            SELECT *
            FROM reviews
            WHERE user_id = $1;
            `, [userId],
        );

        return userReviews.rows;
    }

    async updateReview(reviewId: string, data: UpdateReview): Promise<Review>{
        const { comment, rating } = data;
        let fields: string[] = [];
        let values: (string | number)[] = [reviewId];
        let idx = 2;

        if (comment){
            fields.push(`comment = $${idx}`);
            values.push(comment);
            idx++;
        }

        if (rating){
            fields.push(`rating = $${idx}`);
            values.push(rating);
            idx++;
        }

        const updatedReview = await pool.query(`
            UPDATE reviews
            SET ${fields.join(', ')}
            WHERE id = $1
            RETURNING *
        `, values);

        return updatedReview.rows[0];
    }

    async deleteReview(reviewId: string): Promise<Review>{
        const deletedReview = await pool.query(`
            DELETE FROM reviews
            WHERE id = $1
            RETURNING *;
            `, [reviewId]
        );

        return deletedReview.rows[0];
    }
}

export default new ReviewRepository;