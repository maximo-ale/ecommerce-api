import { Product } from '../entities/product/productTypes';
import { UserInfoWithToken } from '../entities/user/userTypes';
import { createProduct, createUser } from '../utils/createEntitiesForTesting';
import resetDB from '../utils/tables/resetDB';
import { pool } from './testSetup';
import { createOrder, createProductsForCart, invalidId, invalidToken, testAllCases } from './testHelper';
import './testSetup';
import createTables from '../utils/tables/createTables';
import { Item } from '../entities/cart/cartTypes';

describe('Order testing', () => {
    let user1: UserInfoWithToken;
    let user2: UserInfoWithToken;
    let user3: UserInfoWithToken;
    let prod1: Product;
    let prod2: Product;

    // Create testing users and products
    beforeAll(async() => {
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
    });

    describe('Create order', () => {
        const testCases = [
            {
                title: 'Create order with cart with products: (201)',
                getToken: () => user1.token,
                async createProducts(){
                    const products: Item[] = [
                            {product: prod1, quantity: 3},
                            {product: prod2, quantity: 1},
                    ];
                    await createProductsForCart(products, user1.id, {
                        code: 'VALIDCOUPON',
                        maxUses: 2,
                        discountPercent: 25,
                        maxDiscountAmount: 100,
                        expiresAt: new Date('2030-01-01T00:00:00'),
                    });
                },
                expected: 201,
            },
            {
                title: 'Create order with cart with no products: (400)',
                getToken: () => user1.token,
                async createProducts(){
                    const products: Item[] = [];
                    await createProductsForCart(products, user1.id);
                },
                expected: 400,
            },
            {
                title: 'Create order with an expired coupon: (400)',
                getToken: () => user1.token,
                async createProducts(){
                    const products: Item[] = [
                            {product: prod1, quantity: 3},
                            {product: prod2, quantity: 1},
                    ];
                    await createProductsForCart(products, user1.id, {
                        code: 'EXPIREDCOUPON',
                        maxUses: 3,
                        discountPercent: 20,
                        maxDiscountAmount: 120,
                        expiresAt: new Date('2020-01-01T00:00:00'),
                    });
                },
                expected: 400,
            },
            {
                title: 'Create order with no cart: (404)',
                getToken: () => user3.token,
                expected: 404,
            },
            {
                title: 'No token: (401)',
                getToken: () => null,
                expected: 401,
            },
        ];

        it.each(testCases)(
            'should create an order. %s', async({ getToken, createProducts, expected }) => {
                if (createProducts) await createProducts();
                await testAllCases({
                    method: 'post',
                    url: '/api/order/create',
                    getToken,
                    expected,
                });
            }
        );
    });

    describe('Get order details', () => {
        const testCases = [
            {
                title: 'Get valid order details: (200)',
                getToken: () => user1.token,
                async createOrder(){
                    const products: Item[] = [
                            {product: prod1, quantity: 3},
                            {product: prod2, quantity: 1},
                    ];
                    return await createOrder(products, user1.id);
                },
                expected: 200,
            },
            {
                title: 'Get inexistent order details: (404)',
                getToken: () => user1.token,
                async createOrder(){
                    return invalidId();
                },
                expected: 404,
            },
            {
                title: 'Get order details of other user: (404)',
                getToken: () => user2.token,
                async createOrder(){
                    const products: Item[] = [
                            {product: prod1, quantity: 3},
                            {product: prod2, quantity: 1},
                    ];
                    return await createOrder(products, user1.id);
                },
                expected: 404,
            },
            {
                title: 'No token: (401)',
                getToken: () => null,
                async createOrder(){
                    const products: Item[] = [
                            {product: prod1, quantity: 3},
                            {product: prod2, quantity: 1},
                    ];
                    return await createOrder(products, user1.id);
                },
                expected: 401,
            },
        ];

        it.each(testCases)(
            'should get order details. %s', async({ getToken, createOrder, expected }) => {
                let orderId;
                if (createOrder) orderId = await createOrder();
                await testAllCases({
                    method: 'get',
                    url: `/api/order/details/${orderId}`,
                    getToken,
                    expected,
                });
            }
        );
    });

    describe('Get order history', () => {
        const testCases = [
            {
                title: 'Successfully get order history: (200)',
                getToken: () => user1.token,
                async createOrder(){
                    const products: Item[] = [
                        {product: prod1, quantity: 3},
                        {product: prod2, quantity: 2},
                    ];
                    return await createOrder(products, user1.id);
                },
                expected: 200,
            },
            {
                title: 'Get order history with an invalid token: (403)',
                getToken: () => invalidToken(),
                async createOrder(){
                    const products: Item[] = [
                        {product: prod1, quantity: 3},
                        {product: prod2, quantity: 2},
                    ];
                    return await createOrder(products, user1.id);
                },
                expected: 403,
            }
        ]

        it.each(testCases)(
            'should get order history %s', async ({getToken, createOrder, expected}) => {
                let orderId: string;
                if (createOrder) orderId = await createOrder();

                await testAllCases({
                    method: 'get',
                    getToken,
                    url: '/api/order/history',
                    expected,
                });
            }
        );
    });

    describe('Get all orders', () => {
        const testCases = [
            {
                title: 'Successfully get all orders: (200)',
                getToken: () => user1.token,
                expected: 200,
            },
            {
                title: 'Get all orders as a user: (403)',
                getToken: () => user2.token,
                expected: 403,
            },
        ];

        it.each(testCases)(
            'should return all orders %s', async({getToken, expected}) => {
                await testAllCases({
                    method: 'get',
                    getToken,
                    url: '/api/order/all',
                    expected,
                });
            }
        )
    });

    describe('Update order status', () => {
        const testCases = [
            {
                title: 'Correctly update an order status: (200)',
                getToken: () => user1.token,
                async getOrder(){
                    const products: Item[] = [
                        {product: prod1, quantity: 1}
                    ];
                    return await createOrder(products, user1.id);
                },
                body: {
                    status: 'pending'
                },
                expected: 200,
            },
            {
                title: 'Update order status to an invalid status: (400)',
                getToken: () => user1.token,
                async getOrder(){
                    const products: Item[] = [
                        {product: prod1, quantity: 1}
                    ];
                    return await createOrder(products, user1.id);
                },
                body: {
                    status: 'invalidStatus'
                },
                expected: 400,
            },
            {
                title: 'Update order status as a user: (403)',
                getToken: () => user2.token,
                async getOrder(){
                    const products: Item[] = [
                        {product: prod1, quantity: 1}
                    ];
                    return await createOrder(products, user2.id);
                },
                body: {
                    status: 'pending'
                },
                expected: 403,
            },
        ];

        it.each(testCases)(
            'should update order status %s', async({getToken, body, getOrder, expected}) => {
                let orderId;
                if (getOrder) orderId = await getOrder();
                await testAllCases({
                    method: 'patch',
                    getToken,
                    url: `/api/order/status/${orderId}`,
                    body,
                    expected,
                });
            }
        )
    })
})