import './testSetup';
import { createProduct, createUser } from '../utils/createEntitiesForTesting';
import { createEmptyCart, createProductsForCart, invalidId, invalidToken, testAllCases } from './testHelper';
import resetDB from '../utils/tables/resetDB';
import { UserInfoWithToken } from '../entities/user/userTypes';
import { Product } from '../entities/product/productTypes';
import { pool } from './testSetup';
import createTables from '../utils/tables/createTables';
import { Item } from '../entities/cart/cartTypes';
import cartRepository from '../entities/cart/cartRepository';

describe('Cart testing', () => {
    let user1: UserInfoWithToken;
    let user2: UserInfoWithToken;
    let user3: UserInfoWithToken;
    let prod1: Product;
    let prod2: Product;
    beforeAll(async() => {
        await resetDB(pool);
        await createTables(pool);
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
            price: 2500,
            stock: 3,
        }, user1.token);

        prod2 = await createProduct({
            name: 'Bulb1',
            description: 'Bulb with over 10.000 hours of lifetime',
            category: 'Electronics',
            image: 'BulbURL',
            price: 25,
            stock: 75,
        }, user1.token);
    });

    describe('Add product to cart', () => {
        const testCases = [
            {
                title: 'Valid token, valid product, empty cart (new cart created): (201)',
                getToken: () => user1.token,
                getProductId: () => prod1.id,
                quantity: 1,
                expected: 201,
            },
            {
                title: 'Valid token, valid product, cart already created: (200)',
                getToken: () => user2.token,
                getProductId: () => prod2.id,
                async getProducts(){
                    await createEmptyCart(user2.id);
                },
                quantity: 1,
                expected: 200,
            },
            {
                title: 'Add product already added: (200)',
                getToken: () => user1.token,
                getProductId: () => prod2.id,
                async getProducts(){
                    console.log("awaiting...")
                    await createProductsForCart([
                        {product: prod2, quantity: 1}
                    ], user1.id);
                },
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
                getProductId: () => prod1.id,
                quantity: 1,
                expected: 403,
            },
            {
                title: 'No token: (401)',
                getToken: () => null,
                getProductId: () => prod1.id,
                quantity: 1,
                expected: 401,
            },
            {
                title: 'Invalid quantity: (400)',
                getToken: () => user1.token,
                getProductId: () => prod1.id,
                quantity: 0,
                expected: 400,
            },
        ];

        it.each(testCases)(
            'should add a product to the cart. Product %s', async({getToken, getProductId, getProducts, quantity, expected}) => {
                if (getProducts) await getProducts();
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
        beforeAll(async() => {
            await cartRepository.deleteCart(user1.id);
            await cartRepository.deleteCart(user2.id);
            await cartRepository.deleteCart(user3.id);
        });

        const testCases = [
            // TODO: Make user1's cart independent since it currently depends on the previous 'describe()' method to exist. 
            {
                title: 'Valid token, valid cart: (200)',
                getToken: () => user1.token,
                async createCart(){
                    await createEmptyCart(user1.id);
                },
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
            "should return user's cart", async({ getToken, createCart, expected }) => {
                if (createCart) await createCart();
                await testAllCases({
                    method: 'get',
                    url: '/api/cart/',
                    getToken,
                    expected,
                });
        });
    });

    describe('Update product quantity', () => {
        const testCases = [
            {
                title: 'Valid quantity, valid stock: (200)',
                async getProducts(){
                    const items: Item[] = [
                        {
                            product: {...prod1},
                            quantity: 1
                        },
                    ];
                    await createProductsForCart(items, user1.id);
                },
                quantity: 1,
                getToken: () => user1.token,
                getProductId: () => prod1.id,
                expected: 200,
            },
            {
                title: 'Valid quantity, not enough stock: (400)',
                async getProducts(){
                    const items: Item[] = [
                        {
                            product: prod1,
                            quantity: 1
                        },
                    ];
                    await createProductsForCart(items, user1.id);
                },
                quantity: 100,
                getToken: () => user1.token,
                getProductId: () => prod1.id,
                expected: 400,
            },
            {
                title: 'Invalid quantity: (400)',
                async getProducts(){
                    const products: Item[] = [
                        {
                            product: prod1,
                            quantity: 1
                        },
                    ];
                    await createProductsForCart(products, user1.id);
                },
                quantity: -1,
                getToken: () => user1.token,
                getProductId: () => prod1.id,
                expected: 400,
            },
            {
                title: 'Product is not in the cart: (404)',
                async getProducts(){
                    const products: Item[] = [
                        {
                            product: prod1,
                            quantity: 1
                        },
                    ];
                    await createProductsForCart(products, user1.id);
                },
                quantity: 1,
                getToken: () => user1.token,
                getProductId: () => prod2.id,
                expected: 404,
            },
            {
                title: 'Invalid token: (403)',
                async getProducts(){
                    const products = [
                        {
                            product: {...prod1},
                            quantity: 1
                        },
                    ];
                    await createProductsForCart(products, user1.id);
                },
                quantity: 1,
                getToken: () => invalidToken(),
                getProductId: () => prod2.id,
                expected: 403,
            },
        ];

        it.each(testCases)(
            "should update product's quantity %s", async ({getProducts, quantity, getToken, getProductId, expected}) => {
                const productID = getProductId();
                await getProducts();

                await testAllCases({
                    method: 'patch',
                    url: `/api/cart/items/${productID}`,
                    body: {quantity},
                    getToken,
                    expected,
                });
            }
        );
    });

    describe('Remove product', () => {
        const testCases = [
            {
                title: 'Remove existing product: (200)',
                getProductId: () => prod1.id,
                getToken: () => user1.token,
                async createProducts(){
                    const products = [
                        {
                            product: {...prod1},
                            quantity: 1
                        },
                        {
                            product: {...prod2},
                            quantity: 1
                        },
                    ];
                    await createProductsForCart(products, user1.id);
                },
                expected: 200,
            },
            {
                title: 'Remove product that is not in the cart: (400)',
                getProductId: () => prod1.id,
                getToken: () => user1.token,
                async createProducts(){
                    const products: Item[] = [];
                    await createProductsForCart(products, user1.id);
                },
                expected: 400,
            },
            {
                title: 'Remove product with no cart: (404)',
                getProductId: () => prod1.id,
                getToken: () => user3.token,
                expected: 404,
            },
            {
                title: 'No token: (401)',
                getProductId: () => prod1.id,
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
                    url: `/api/cart/items/${productID}`,
                    getToken,
                    expected,
                });
            }
        );
    });
});