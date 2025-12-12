import couponService from './couponService';
import type { Request, Response } from 'express';

class CouponController{
    async createCoupon(req: Request, res: Response){
        const coupon = await couponService.createCoupon(req.body);

        res.status(201).json({
            message: 'New coupon created successfully',
            coupon,
        });
    }

    async getAllCoupons(req: Request, res: Response){
        const allCoupons = await couponService.getAllCoupons();

        res.status(200).json({
            message: 'All coupons found successfully',
            allCoupons,
        });
    }

    async deleteCoupon(req: Request, res: Response){
        const coupon = await couponService.deleteCoupon(req.params.couponId);

        res.status(200).json({
            message: 'Coupon deleted successfully',
            coupon,
        });
    }

    async deleteAll(req: Request, res: Response){
        const allCoupons = await couponService.deleteAll();

        res.status(200).json({
            message: 'All coupons deleted successfully',
            allCoupons,
        });
    }
}

export default new CouponController();