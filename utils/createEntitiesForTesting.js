import request from 'supertest';
import app from '../server.js';

export const createUser = async (userData) => {
    const res = await request(app)
        .post('/api/auth/register')
        .send(userData);
        
    console.log(`token: ${res.body.token}`);
    return {data: res.body.user, token: res.body.token};
}

export const createProduct = async (productData, token) => {
    const res = await request(app)
        .post('/api/products/create')
        .send(productData)
        .set('Authorization', `Bearer ${token}`);

    return res.body.product;
}