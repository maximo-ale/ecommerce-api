import couponService from './couponService.js';

class CouponController{
    async createCoupon(req, res){
        const coupon = await couponService.createCoupon(req.body);

        res.status(201).json({
            message: 'New coupon created successfully',
            coupon,
        });
    }

    async getAllCoupons(req, res){
        const allCoupons = await couponService.getAllCoupons();

        res.status(200).json({
            message: 'All coupons found successfully',
            allCoupons,
        });
    }

    async deleteCoupon(req, res){
        const coupon = await couponService.deleteCoupon(req.params.couponId);

        res.status(200).json({
            message: 'Coupon deleted successfully',
            coupon,
        });
    }

    async deleteAll(req, res){
        const allCoupons = await couponService.deleteAll();

        res.status(200).json({
            message: 'All coupons deleted successfully',
            allCoupons,
        });
    }
}

export default new CouponController();