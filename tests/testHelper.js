import request from 'supertest';
import app from '../server.js';
import cartRepository from '../entities/cart/cartRepository.js';
import orderRepository from '../entities/order/orderRepository.js';

export const getEntityID = (entity) => {
    return entity._id;
}

export const invalidId = () => {
    // Return ID that will not exist in the DB
    return '64f8b2c1e1a3b4d5f6a7b8c9';
}

export const invalidToken = () => {
    // Return token that will not be valid
    return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGY4YjJjMWUxYTNiNGQ1ZjZhN2I4YzkiLCJyb2xlIjoidXNlciIsImlhdCI6MTY5MzY2NzYwMCwiZXhwIjoxNjkzNjcxMjAwfQ.Qr6XfqEq3rQ2KkYwS5s8rFQaSx_Z5t4V5N6rONr9P5E`;
}

export const createProductsForCart = async(products, user) => {
    if (!products || products.length <= 0) return;
    
    // Create testing user's cart
    let userCart = await cartRepository.getUserCart(getEntityID(user));
    if (userCart){
        await cartRepository.cleanCart(getEntityID(user));
    } else {
        userCart = await cartRepository.createNewCart(
            {user: getEntityID(user), items: []}
        );
    }

    // Add all products to the cart
    for (const p of products){
        userCart.items.push({product: p.product, quantity: p.quantity});
    }

    // Save
    await cartRepository.saveCart(userCart);
}

export const createOrder = async(products, user) => {
    const newOrder = await orderRepository.createOrder({
        user: getEntityID(user),
        items: products,
        total: 100,
        status: 'payed',
        createdAt: Date.now(),
    });
    return getEntityID(newOrder);
}

export const testAllCases = async({ method, url, body, getToken, expected}) => {
    let token;
    if (getToken) token = getToken();

    let req = request(app)[method](url);

    if (body) req = req.send(body);
    if (token && token !== 'null' && token !== 'undefined') req = req.set('Authorization', `Bearer ${token}`);

    const res = await req;

    if (res.status !== expected){
        console.log(res.body);
    }

    expect(res.status).toBe(expected);
}