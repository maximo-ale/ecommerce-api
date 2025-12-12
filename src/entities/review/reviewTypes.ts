import { Product, ReducedProductInfo } from "../product/productTypes";
import { ProtectedUserInfo, User } from "../user/userTypes";

export interface CreateReview{
    comment: string,
    rating: number,
}

export interface Review{
    id: string,
    user: ProtectedUserInfo,
    product: ReducedProductInfo,
    comment: string,
    rating: number,
}

export interface UpdateReview{
    comment?: string,
    rating?: number,
}