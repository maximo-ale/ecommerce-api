import mongoose from 'mongoose';

const {Schema, model} = mongoose;

const couponSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
    },
    maxUses: {
        type: Number,
        required: true,
    },
    usedTimes: {
        type: Number,
    },
    maxDiscountAmount: {
        type: Number,
        default: null,
        min: 1,
    },
    discountPercent: {
        type: Number,
        required: true,
        min: 1,
        max: 100,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    usedBy: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
});

export default model('Coupon', couponSchema);