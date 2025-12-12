import { Coupon } from "../coupon/couponTypes";
import { Product } from "../product/productTypes";
import { ProtectedUserInfo, User } from "../user/userTypes";

export interface AddProduct{
    productId: string,
    quantity: number,
}

export interface CreateCart{
    userId: string,
    item?: {
        product: Product,
        quantity: number,
    }
    couponId?: string,
}

export interface UpdateProductQuantity{
    quantity: number,
    productId: string,
    userId: string,
}

export interface Cart{
    id: string,
    user: ProtectedUserInfo,
    items: {
        product: Product,
        quantity: number,
    }[],
    coupon?: Coupon | null,
}

export interface Item{
    product: Product,
    quantity: number,
}