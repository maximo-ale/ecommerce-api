export interface Coupon{
    id: string,
    code: string,
    maxUses: number,
    usedTimes: number,
    maxDiscountAmount: number,
    discountPercent: number,
    expiresAt: Date,
}

export interface CreateCoupon{
    code: string,
    maxUses: number,
    maxDiscountAmount?: number,
    discountPercent: number,
    expiresAt: Date,
}