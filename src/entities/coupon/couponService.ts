import { BadRequestError, NotFoundError } from '../../utils/errors';
import couponRepository from './couponRepository';
import { Coupon } from './couponTypes';

class CouponService{
    async createCoupon(data: Coupon): Promise<Coupon>{
        const {code, discountPercent, maxDiscountAmount, expiresAt, maxUses} = data;

        const newCoupon: Coupon = await couponRepository.createCoupon({
            code,
            maxUses,
            maxDiscountAmount,
            discountPercent,
            expiresAt,
        });

        return newCoupon;
    }

    async getAllCoupons(){
        const allCoupons = await couponRepository.getAllCoupons();

        if (allCoupons.length === 0){
            throw new NotFoundError('No coupons found');
        }

        return allCoupons;
    }

    async deleteCoupon(couponId: string): Promise<Coupon>{
        const coupon: Coupon | null = await couponRepository.deleteCoupon(couponId);

        if (!coupon){
            throw new NotFoundError('Coupon not found');
        }

        return coupon;
    }

    async deleteAll(): Promise<Coupon[]>{
        const coupons = await couponRepository.deleteAllCoupons();

        if (coupons.length === 0){
            throw new BadRequestError('No coupons exist yet');
        }

        return coupons;
    }
}

export default new CouponService();