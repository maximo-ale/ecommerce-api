const Coupon = require("../models/Coupon");

exports.createCoupon = async (req, res) => {
    try {
        const {code, discountPercent, maxDiscountAmount, expiresAt, maxUses} = req.body;

        const newCoupon = new Coupon({
            code,
            maxUses,
            maxDiscountAmount: maxDiscountAmount,
            usedTimes: 0,
            discountPercent,
            expiresAt,
        });

        await newCoupon.save();

        res.status(201).json({
            message: 'New coupon created successfully',
            coupon: newCoupon,
        });
    } catch (err) {
        if (err.code === 11000){
            return res.status(400).json({message: 'Coupon code must be unique'});
        }
        console.error(err);
        return res.status(500).json({message: 'Internal server error'});
    }
}

exports.getAllCoupons = async (req, res) => {
    try {
        const allCoupons = await Coupon.find();

        if (allCoupons.length === 0){
            return res.status(404).json({message: 'No coupons found'});
        }

        res.status(200).json({
            message: 'All coupons found successfully',
            allCoupons,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Internal server error'});
    }
}

exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.couponId);

        if (!coupon){
            return res.status(404).json({message: 'Coupon not found'});
        }

        res.status(200).json({
            message: 'Coupon deleted successfully',
            coupon,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Internal server error'});
    }
}

exports.deleteAll = async (req, res) => {
    try {
        await Coupon.deleteMany();

        res.status(200).json({message: 'All coupons deleted successfully'});
    } catch (err){
        console.error(err);
        return res.status(500).json({message: 'Internal server error'});
    }
}