import { BadRequestError, NotFoundError } from '../../utils/errors.js';
import couponRepository from './couponRepository.js';

class CouponService{
    async createCoupon(data){
        const {code, discountPercent, maxDiscountAmount, expiresAt, maxUses} = data;

        const newCoupon = couponRepository.createCoupon({
            code,
            maxUses,
            maxDiscountAmount: maxDiscountAmount,
            usedTimes: 0,
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

    async deleteCoupon(couponId){
        const coupon = await couponRepository.deleteCoupon(couponId);

        if (!coupon){
            throw new NotFoundError('Coupon not found');
        }

        return coupon;
    }

    async deleteAll(){
        const coupons = await couponRepository.deleteAllCoupons();

        if (coupons.length === 0){
            throw new BadRequestError('No coupons exist yet');
        }

        return coupons;
    }
}

export default new CouponService();