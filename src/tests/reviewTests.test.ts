import './testSetup';
import { Product } from "../entities/product/productTypes";
import { UserInfoWithToken } from "../entities/user/userTypes";
import { createProduct, createUser } from "../utils/createEntitiesForTesting";
import createTables from "../utils/tables/createTables";
import resetDB from "../utils/tables/resetDB";
import { pool } from "./testSetup";
import { createOrder, createReview, invalidId, testAllCases } from './testHelper';
import { Item } from '../entities/cart/cartTypes';
import { CreateReview, Review } from '../entities/review/reviewTypes';
import { userIdSchema } from '../utils/zod/idSchema';

describe('Test reviews', () => {
    let user1: UserInfoWithToken;
    let user2: UserInfoWithToken;
    let user3: UserInfoWithToken;
    let prod1: Product;
    let prod2: Product;
    beforeAll(async () => {
        
        await resetDB(pool);
        await createTables(pool);
        user1 = await createUser({
            name: 'testingUser6',
            email: 'user6@gmail.com',
            password: '123456',
            isAdmin: true,
        });

        user2 = await createUser({
            name: 'testingUser7',
            email: 'user7@gmail.com',
            password: '123456',
        });

        user3 = await createUser({
            name: 'testingUser8',
            email: 'user8@gmail.com',
            password: '123456',
        });

        prod1 = await createProduct({
            name: 'Computer2',
            description: 'High-quality gaming computer',
            category: 'Gaming',
            image: 'PCURL',
            price: 2500,
            stock: 3,
        }, user1.token);

        prod2 = await createProduct({
            name: 'Bulb2',
            description: 'Bulb with over 10.000 hours of lifetime',
            category: 'Electronics',
            image: 'BulbURL',
            price: 25,
            stock: 75,
        }, user1.token);
    })

    describe('Create review', () => {
        const testCases = [
            {
                title: 'Correctly create a review: (201)',
                getToken: () => user1.token,
                async createOrder(){
                    const products: Item[] = [
                        { product: prod1, quantity: 3},
                    ];
                    await createOrder(products, user1.id);
                },
                body: {
                    comment: 'Awesome',
                    rating: 4,
                },
                productId: () => prod1.id, 
                expected: 201,
            },
            {
                title: 'Create 2 reviews for the same product: (400)',
                getToken: () => user1.token,
                async createOrder(){
                    const products: Item[] = [
                        { product: prod1, quantity: 3},
                    ];
                    await createOrder(products, user1.id);
                },
                body: {
                    comment: 'Same review',
                    rating: 4,
                },
                productId: () => prod1.id, 
                expected: 400,
            },
            {
                title: 'Create a review of a product which the user has not bought yet: (403)',
                getToken: () => user2.token,
                body: {
                    comment: 'Incredible',
                    rating: 5,
                },
                productId: () => prod1.id, 
                expected: 403,
            },
            {
                title: 'Create a review of a product that does not exist: (404)',
                getToken: () => user1.token,
                body: {
                    comment: 'Bad',
                    rating: 2,
                },
                productId: () => invalidId(), 
                expected: 404,
            },
        ]

        it.each(testCases)(
            'should create a review. %s', async({body, createOrder, productId, getToken, expected}) => {
                if (createOrder) await createOrder();
                await testAllCases({
                    method: 'post',
                    getToken,
                    body,
                    url: `/api/review/${productId()}`,
                    expected,
                })
            } 
        );
    });

    describe('Update review', () => {
        const testCases = [
            {
                title: 'Correctly update a review: (200)',
                getToken: () => user1.token,
                async createReview(){
                    const review: CreateReview = {
                        comment: 'Incredible',
                        rating: 5,
                    }
                    return await createReview(review, prod1.id, user1.id);
                },
                body: {
                    comment: 'Awesome',
                    rating: 4,
                },
                expected: 200,
            },
            {
                title: 'Update a review with invalid fields: (400)',
                getToken: () => user1.token,
                async createReview(){
                    const review: CreateReview = {
                        comment: 'Incredible',
                        rating: 5,
                    }
                    return await createReview(review, prod1.id, user1.id);
                },
                body: {
                    comment: true,
                    rating: [],
                },
                expected: 400,
            },
            {
                title: 'Update a review making no changes: (400)',
                getToken: () => user1.token,
                async createReview(){
                    const review: CreateReview = {
                        comment: 'Incredible',
                        rating: 5,
                    }
                    return await createReview(review, prod1.id, user1.id);
                },
                expected: 400,
            },
            {
                title: 'Update an inexistent review: (404)',
                getToken: () => user1.token,
                async createReview(){
                    return invalidId();
                },
                body: {
                    comment: 'Epic',
                    rating: 5,
                },
                expected: 404,
            },
        ]

        it.each(testCases)(
            'should update a review. %s', async({body, createReview, getToken, expected}) => {
                let reviewId;
                if (createReview) reviewId = await createReview();
                await testAllCases({
                    method: 'patch',
                    getToken,
                    url: `/api/review/${reviewId}`,
                    body,
                    expected,
                })
            } 
        );
    });

    describe('Get product reviews', () => {
        const testCases = [
            {
                title: 'Correctly get procuct reviews: (200)',
                getToken: () => user1.token,
                async createReview(){
                    const review: CreateReview = {
                        comment: 'Incredible', rating: 5
                    };
                    return await createReview(review, prod1.id, user1.id);
                },
                productId: () => prod1.id,
                expected: 200,
            },
            {
                title: 'Get reviews of a product that does not exist: (404)',
                getToken: () => user1.token,
                async createReview(){
                    const review: CreateReview = {
                        comment: 'Incredible', rating: 5
                    };
                    return await createReview(review, prod1.id, user1.id);
                },
                productId: () => invalidId,
                expected: 404,
            },
        ]

        it.each(testCases)(
            'should get all reviews of a product', async({getToken, productId, createReview, expected}) => {
                if (createReview) await createReview();
                await testAllCases({
                    method: 'get',
                    getToken,
                    url: `/api/review/reviews/${productId()}`,
                    expected,
                })
            } 
        );
    });

    describe('Get all reviews made by a user', () => {
        const testCases = [
            {
                title: 'Correctly get user reviews: (200)',
                getToken: () => user1.token,
                async createReview(){
                    const review: CreateReview = {
                        comment: 'Incredible', rating: 5
                    };
                    return await createReview(review, prod1.id, user1.id);
                },
                getUserId: () => user1.id,
                expected: 200,
            },
            {
                title: 'Get reviews of a user that does not exist: (404)',
                getToken: () => user1.token,
                async createReview(){
                    const review: CreateReview = {
                        comment: 'Incredible', rating: 5
                    };
                    return await createReview(review, prod1.id, user1.id);
                },
                getUserId: () => invalidId(),
                expected: 404,
            },
        ]

        it.each(testCases)(
            'should get all the reviews made by a user', async({getUserId, getToken, expected}) => {
                let userId;
                if (getUserId) userId = getUserId(); 
                await testAllCases({
                    method: 'get',
                    getToken,
                    url: `/api/review/user-reviews/${userId}`,
                    expected,
                });
            } 
        );
    });

    describe('Delete review', () => {
        const testCases = [
            {
                title: 'Correctly delete a review: (200)',
                getToken: () => user1.token,
                async createReview(){
                    const review: CreateReview = {
                        comment: 'Incredible', rating: 5
                    };
                    return await createReview(review, prod1.id, user1.id);
                },
                expected: 200,
            },
            {
                title: 'Delete a review that does not exist: (404)',
                getToken: () => user1.token,
                async createReview(){
                    return invalidId();
                },
                expected: 404,
            },
            {
                title: 'Delete a review of another user without being an admin: (403)',
                getToken: () => user2.token,
                async createReview(){
                    const review: CreateReview = {
                        comment: 'Incredible', rating: 5
                    };
                    return await createReview(review, prod1.id, user1.id);
                },
                expected: 403,
            },
        ]

        it.each(testCases)(
            'should delete a review', async({createReview, getToken, expected}) => {
                let reviewId;
                if (createReview) reviewId = await createReview();
                await testAllCases({
                    method: 'delete',
                    getToken,
                    url: `/api/review/${reviewId}`,
                    expected,
                })
            } 
        );
    });
});