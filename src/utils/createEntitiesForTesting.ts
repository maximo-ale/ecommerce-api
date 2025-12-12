import request from 'supertest';
import app from '../server';
import { CreateProduct, Product } from '../entities/product/productTypes';
import { RegisterUser, User, UserInfoWithToken } from '../entities/user/userTypes';
import { CreateReview, Review } from '../entities/review/reviewTypes';

export const createUser = async (userData: RegisterUser): Promise<UserInfoWithToken> => {
    const res = await request(app)
        .post('/api/auth/register')
        .send(userData);
        
    const { id, name, token } = res.body.result;
    return {id, name, token};
}

export const createProduct = async (productData: CreateProduct, token: string): Promise<Product> => {
    const res = await request(app)
        .post('/api/products/create')
        .send(productData)
        .set('Authorization', `Bearer ${token}`);

    const {id, name, description, category, price, stock, image} = res.body.product;
    return {
        id,
        name,
        description,
        category,
        price,
        stock,
        image
    };
}