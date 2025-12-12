import { Product } from "../product/productTypes"
import { ProtectedUserInfo } from "../user/userTypes"

export interface Order{
    id: string,
    user: ProtectedUserInfo,
    items: {
        product: Product,
        quantity: number,
    }[],
    total: number,
    createdAt: Date,
    status: 'paid' | 'cancelled' | 'pending' | 'sent',
}

export interface CreateOrder{
    user: string,
    items: {
        product: Product,
        quantity: number,
    }[],
    total: number,
    createdAt: Date,
    status: 'paid' | 'cancelled' | 'pending' | 'sent',
}

export interface OrderStatus{
    id: string,
    status: 'paid' | 'cancelled' | 'pending' | 'sent',
}