import './testSetup.js';
import { createProduct, createUser } from '../utils/createEntitiesForTesting.js';
import { createProductsForCart, getEntityID, invalidId, invalidToken, testAllCases } from './testHelper.js';
import cartRepository from '../entities/cart/cartRepository.js';
import resetDB from '../utils/resetDB.js';

describe('Cart testing', () => {
    let user1;
    let user2;
    let user3;
    let prod1;
    let prod2;
    beforeAll(async() => {
        await resetDB();
        user1 = await createUser({
            name: 'testingUser1',
            email: 'user1@gmail.com',
            password: '123456',
            isAdmin: true,
        });

        user2 = await createUser({
            name: 'testingUser2',
            email: 'user2@gmail.com',
            password: '123456',
        });

        user3 = await createUser({
            name: 'testingUser3',
            email: 'user3@gmail.com',
            password: '123456',
        });

        prod1 = await createProduct({
            name: 'Computer1',
            description: 'High-quality gaming computer',
            category: 'Gaming',
            image: 'PCURL',
            price: '2500',
            stock: '3',
        }, user1.token);

        prod2 = await createProduct({
            name: 'Bulb1',
            description: 'Bulb with over 10.000 hours of lifetime',
            category: 'Electronics',
            image: 'BulbURL',
            price: '25',
            stock: '75',
        }, user1.token);
    });

    describe('Add product to cart', () => {
        const testCases = [
            {
                title: 'Valid token, valid product, empty cart (new cart created): (201)',
                getToken: () => user1.token,
                getProductId: () => getEntityID(prod1),
                quantity: 1,
                expected: 201,
            },
            {
                title: 'Valid token, valid product, cart already created: (200)',
                getToken: () => user1.token,
                getProductId: () => getEntityID(prod2),
                quantity: 1,
                expected: 200,
            },
            {
                title: 'Add product already added: (200)',
                getToken: () => user1.token,
                getProductId: () => getEntityID(prod2),
                quantity: 1,
                expected: 200,
            },
            {
                title: 'Product not found: (404)',
                getToken: () => user1.token,
                getProductId: () => invalidId(),
                quantity: 1,
                expected: 404,
            },
            {
                title: 'Invalid token: (403)',
                getToken: () => invalidToken(),
                getProductId: () => getEntityID(prod1),
                quantity: 1,
                expected: 403,
            },
            {
                title: 'No token: (401)',
                getToken: () => null,
                getProductId: () => getEntityID(prod1),
                quantity: 1,
                expected: 401,
            },
            {
                title: 'Invalid quantity: (400)',
                getToken: () => user1.token,
                getProductId: () => getEntityID(prod1),
                quantity: 0,
                expected: 400,
            },
        ];

        it.each(testCases)(
            'should add a product to the cart. Product %s', async({getToken, getProductId, quantity, expected}) => {
                const productId = getProductId();
                await testAllCases({
                    method: 'post',
                    url: '/api/cart/add',
                    body: { productId, quantity },
                    getToken,
                    expected,
                });
            },
        );
    });

    describe('Get user cart', () => {
        const testCases = [
            {
                title: 'Valid token, valid cart: (200)',
                getToken: () => user1.token,
                expected: 200,
            },
            {
                title: 'No token: (401)',
                getToken: () => null,
                expected: 401,
            },
            {
                title: 'Invalid token: (403)',
                getToken: () => invalidToken(),
                expected: 403,
            },
            {
                title: 'Valid token, no cart: (404)',
                getToken: () => user2.token,
                expected: 404,
            },
        ];

        it.each(testCases)(
            "should return user's cart", async({ getToken, expected }) => {
                await testAllCases({
                    method: 'get',
                    url: '/api/cart/',
                    getToken,
                    expected,
                });
        });
    });

    describe('Modify product quantity', () => {
        const testCases = [
            {
                title: 'Valid quantity, valid stock: (200)',
                async getProducts(){
                    const products = [
                        {product: getEntityID(prod1), quantity: 1},
                    ];
                    await createProductsForCart(products, user1.data);
                },
                quantity: 1,
                getToken: () => user1.token,
                getProductId: () => getEntityID(prod1),
                expected: 200,
            },
            {
                title: 'Valid quantity, not enough stock: (400)',
                async getProducts(){
                    const products = [
                        {product: getEntityID(prod1), quantity: 1},
                    ];
                    await createProductsForCart(products, user1.data);
                },
                quantity: 100,
                getToken: () => user1.token,
                getProductId: () => getEntityID(prod1),
                expected: 400,
            },
            {
                title: 'Invalid quantity: (400)',
                async getProducts(){
                    const products = [
                        {product: getEntityID(prod1), quantity: 1},
                    ];
                    await createProductsForCart(products, user1.data);
                },
                quantity: -1,
                getToken: () => user1.token,
                getProductId: () => getEntityID(prod1),
                expected: 400,
            },
            {
                title: 'Product is not in the cart: (404)',
                async getProducts(){
                    const products = [
                        {product: getEntityID(prod1), quantity: 1},
                    ];
                    await createProductsForCart(products, user1.data);
                },
                quantity: 1,
                getToken: () => user1.token,
                getProductId: () => getEntityID(prod2),
                expected: 404,
            },
            {
                title: 'Invalid token: (403)',
                async getProducts(){
                    const products = [
                        {product: getEntityID(prod1), quantity: 1},
                    ];
                    await createProductsForCart(products, user1.data);
                },
                quantity: 1,
                getToken: () => invalidToken(),
                getProductId: () => getEntityID(prod2),
                expected: 403,
            },
        ];

        it.each(testCases)(
            "should modify product's quantity %s", async ({getProducts, quantity, getToken, getProductId, expected}) => {
                const productID = getProductId();
                await getProducts();

                await testAllCases({
                    method: 'patch',
                    url: `/api/cart/modifyQuantity/${productID}`,
                    body: {quantity},
                    getToken,
                    expected,
                });
            }
        );

        (async() => {
            await cartRepository.cleanCart(getEntityID(user1.data));
            await cartRepository.cleanCart(getEntityID(user2.data));
            await cartRepository.cleanCart(getEntityID(user3.data));
        });
    });

    describe ('Remove product', () => {
        const testCases = [
            {
                title: 'Remove existing product: (200)',
                getProductId: () => getEntityID(prod1),
                getToken: () => user1.token,
                async createProducts(){
                    const products = [
                            {product: getEntityID(prod1), quantity: 3},
                            {product: getEntityID(prod2), quantity: 1},
                    ];
                    await createProductsForCart(products, user1.data);
                },
                expected: 200,
            },
            {
                title: 'Remove product that is not in the cart: (400)',
                getProductId: () => getEntityID(prod1),
                getToken: () => user1.token,
                async createProducts(){
                    const products = [];
                    await createProductsForCart(products, user1);
                },
                expected: 400,
            },
            {
                title: 'Remove product with no cart: (404)',
                getProductId: () => getEntityID(prod1),
                getToken: () => user3.token,
                expected: 404,
            },
            {
                title: 'No token: (401)',
                getProductId: () => getEntityID(prod1),
                getToken: () => null,
                expected: 401,
            },
        ];

        it.each(testCases)(
            'should remove a product from the cart. %s', async({ getToken, createProducts, getProductId, expected }) => {
                let productID;
                if (getProductId) productID = getProductId(); 
                if (createProducts) await createProducts();
                await testAllCases({
                    method: 'delete',
                    url: `/api/cart/removeProduct/${productID}`,
                    getToken,
                    expected,
                });
            }
        );

        afterEach(async() => {
            await cartRepository.cleanCart(getEntityID(user1.data));
            await cartRepository.cleanCart(getEntityID(user2.data));
            await cartRepository.cleanCart(getEntityID(user3.data));
        });
    });
});