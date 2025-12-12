import pool from '../../config/connectDB';
import { Coupon, CreateCoupon } from './couponTypes';

class CouponRepository{
    async createCoupon(data: CreateCoupon): Promise<Coupon>{
        const { code, maxUses, discountPercent, maxDiscountAmount = null, expiresAt } = data;

        const result = await pool.query(`
            INSERT INTO coupons (code, max_uses, max_discount_amount, discount_percent, expires_at)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, code,
                      max_discount_amount AS "maxDiscountAmount",
                      max_uses AS "maxUses",
                      discount_percent AS "discountPercent",
                      used_times AS "usedTimes",
                      expires_at AS "expiresAt"
            `, [code, maxUses, maxDiscountAmount, discountPercent, expiresAt]
        );

        return result.rows[0];
    }

    async findCouponByCode(code: string): Promise<Coupon | null>{
        const result = await pool.query(`
            SELECT id, code,
                      max_discount_amount AS "maxDiscountAmount",
                      max_uses AS "maxUses",
                      discount_percent AS "discountPercent",
                      used_times AS "usedTimes",
                      expires_at AS "expiresAt"
            FROM coupons
            WHERE code = $1;
            `, [code]
        );

        const coupon: Coupon = result.rows[0];
        if (!coupon) return null;

        return coupon;
    }

    async findCouponById(couponId: string): Promise<Coupon | null>{
        const result = await pool.query(`
            SELECT id, code,
                      max_discount_amount AS "maxDiscountAmount",
                      max_uses AS "maxUses",
                      discount_percent AS "discountPercent",
                      used_times AS "usedTimes",
                      expires_at AS "expiresAt"
            FROM coupons
            WHERE id = $1;
        `, [couponId]);

        const coupon = result.rows[0];
        if (!coupon) return null;
        
        return coupon;
    }
    async getAllCoupons(): Promise<Coupon[]>{
        const result = await pool.query(`
            SELECT *
            FROM coupons;
            `
        );

        return result.rows;
    }

    async deleteCoupon(couponId: string): Promise<Coupon | null>{
        const result = await pool.query(`
            DELETE FROM coupons
            WHERE id = $1
            `, [couponId]
        );

        const coupon: Coupon = result.rows[0];

        if (!coupon) return null;
        return coupon;
    }

    async deleteAllCoupons(): Promise<Coupon[]>{
        const result = await pool.query(`
            TRUNCATE TABLE coupons RESTART IDENTITY CASCADE;
            `
        );

        return result.rows;
    }
}

export default new CouponRepository();