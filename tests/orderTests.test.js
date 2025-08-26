import cartRepository from '../entities/cart/cartRepository';
import { createProduct, createUser } from '../utils/createEntitiesForTesting';
import resetDB from '../utils/resetDB';
import { createOrder, createProductsForCart, getEntityID, invalidId, invalidToken, testAllCases } from './testHelper';
import './testSetup';

describe('Order testing', () => {
    let user1;
    let user2;
    let user3;
    let prod1;
    let prod2;
    beforeAll(async() => {
        await resetDB();
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
            price: '2500',
            stock: '3',
        }, user1.token);

        prod2 = await createProduct({
            name: 'Bulb2',
            description: 'Bulb with over 10.000 hours of lifetime',
            category: 'Electronics',
            image: 'BulbURL',
            price: '25',
            stock: '75',
        }, user1.token);
    });

    describe('Create order', () => {
        const testCases = [
            {
                title: 'Create order with cart with products: (201)',
                getToken: () => user1.token,
                async createProducts(){
                    const products = [
                            {product: getEntityID(prod1), quantity: 3},
                            {product: getEntityID(prod2), quantity: 1},
                    ];
                    await createProductsForCart(products, user1.data);
                },
                expected: 201,
            },
            {
                title: 'Create order with cart with no products: (400)',
                getToken: () => user1.token,
                async createProducts(){
                    const products = [];
                    await createProductsForCart(products, user1);
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

        afterEach(async() => {
            await cartRepository.cleanCart(getEntityID(user1.data));
            await cartRepository.cleanCart(getEntityID(user2.data));
        });
    });

    describe('Get order details', () => {
        const testCases = [
            {
                title: 'Get valid order details: (200)',
                getToken: () => user1.token,
                async createOrder(){
                    const products = [
                            {product: getEntityID(prod1), quantity: 3},
                            {product: getEntityID(prod2), quantity: 1},
                    ];
                    return await createOrder(products, user1.data);
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
                    const products = [
                            {product: getEntityID(prod1), quantity: 3},
                            {product: getEntityID(prod2), quantity: 1},
                    ];
                    return await createOrder(products, user1.data);
                },
                expected: 404,
            },
            {
                title: 'No token: (401)',
                getToken: () => null,
                async createOrder(){
                    const products = [
                            {product: getEntityID(prod1), quantity: 3},
                            {product: getEntityID(prod2), quantity: 1},
                    ];
                    return await createOrder(products, user1.data);
                },
                expected: 401,
            },
        ];

        it.each(testCases)(
            'should get order details. %s', async({ getToken, createOrder, expected }) => {
                let orderID;
                if (createOrder) orderID = await createOrder();
                await testAllCases({
                    method: 'get',
                    url: `/api/order/details/${orderID}`,
                    getToken,
                    expected,
                });
            }
        );
    });
})