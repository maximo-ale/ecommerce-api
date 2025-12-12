import request from 'supertest';
import app from '../server';
import cartRepository from '../entities/cart/cartRepository';
import orderRepository from '../entities/order/orderRepository';
import { Product } from '../entities/product/productTypes';
import { Cart, Item } from '../entities/cart/cartTypes';
import userRepository from '../entities/user/userRepository';
import { Order } from '../entities/order/orderTypes';
import { CreateReview, Review } from '../entities/review/reviewTypes';
import reviewRepository from '../entities/review/reviewRepository';
import { Coupon, CreateCoupon } from '../entities/coupon/couponTypes';
import couponRepository from '../entities/coupon/couponRepository';

interface TestCases{
    method: 'post' | 'get' | 'patch' | 'post' | 'delete',
    getToken?: any,
    url: string,
    expected: number,
    body?: any,
}
export const getEntityID = (entity: any) => {
    return entity.id;
}

export const invalidId = () => {
    // Return ID that will not exist in the DB
    return '9999999';
}

export const invalidToken = () => {
    // Return token that will not be valid
    return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGY4YjJjMWUxYTNiNGQ1ZjZhN2I4YzkiLCJyb2xlIjoidXNlciIsImlhdCI6MTY5MzY2NzYwMCwiZXhwIjoxNjkzNjcxMjAwfQ.Qr6XfqEq3rQ2KkYwS5s8rFQaSx_Z5t4V5N6rONr9P5E`;
}

export const createEmptyCart = async(userId: string): Promise<Cart> => {
    const newCart = await cartRepository.createNewCart({
            userId: userId,
        });

    return newCart;
}
export const createProductsForCart = async(items: Item[], userId: string, couponData?: CreateCoupon): Promise<void> => {
    // Ensure at least 1 item is being added
    if (!items || items.length <= 0) return;
    
    // Create testing user's cart
    let userCart: Cart | null = await cartRepository.getUserCart(userId);

    if (userCart){
        await cartRepository.clearCart(userCart);
    } else {
        userCart = await createEmptyCart(userId);
    }

    if (couponData){
        const couponId: string = await createCoupon(couponData);
        await cartRepository.addCoupon(userCart, couponId);
    }

    for (let i = 0; i < items.length; i++){
        await cartRepository.addProductToCart(items[i].product.id, items[i].quantity, userCart)
    }
}

export const createOrder = async(items: Item[], userId: string): Promise<string> => {
    const newOrder: Order = await orderRepository.createOrder({
        user: userId,
        items,
        total: 100,
        status: 'paid',
        createdAt: new Date(),
    });
    return newOrder.id;
}

export const createCoupon = async(data: CreateCoupon): Promise<string> => {
    const coupon: Coupon = await couponRepository.createCoupon(data);
    return coupon.id;
}

export const getCouponCode = async(validCode: boolean): Promise<string> => {
    let code: string;
    if (validCode){
        const coupon = await couponRepository.createCoupon({
            code: 'VALID',
            maxUses: 3,
            discountPercent: 20,
            maxDiscountAmount: 750,
            expiresAt: new Date('2030-01-01T00:00:00'),
        });
        code = coupon.code;
    } else {
        code = 'NOT VALID'
    }

    return code;
}
// Create a review and return its ID
export const createReview = async(reviewData: CreateReview, productId: string, userId: string): Promise<string> => {
    const { comment, rating } = reviewData;
    const newReview: Review = await reviewRepository.createReview({
        comment,
        rating,
    }, productId, userId);
    return newReview.id;
}

export const testAllCases = async(data: TestCases) => {
    const { method, url, getToken, body, expected } = data;
    let token: string | undefined;

    if (getToken) token = getToken();

    let req = request(app)[method](url);

    if (body) req = req.send(body);
    if (token && token !== 'null' && token !== 'undefined') req = req.set('Authorization', `Bearer ${token}`);

    const res = await req;

    if (res.status !== expected){
        // console.log('error body here: ', res.body);
    }

    expect(res.status).toBe(expected);
}