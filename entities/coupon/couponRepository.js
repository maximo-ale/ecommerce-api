import Coupon from './Coupon.js';

class CouponRepository{
    async createCoupon(data){
        const coupon = new Coupon(data);
        return await coupon.save();
    }

    async findCouponByCode({code}){
        return await Coupon.findOne({code});
    }

    async getAllCoupons(){
        return await Coupon.find();
    }

    async deleteCoupon(couponId){
        return await Coupon.findByIdAndDelete(couponId);
    }

    async deleteAllCoupons(){
        return await Coupon.deleteMany();
    }

    async saveCoupon(coupon){
        await coupon.save();
    }
}

export default new CouponRepository();