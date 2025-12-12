import './testSetup';
import { invalidId, invalidToken, testAllCases } from './testHelper';
import { createProduct, createUser } from '../utils/createEntitiesForTesting';
import { UserInfoWithToken } from '../entities/user/userTypes';
import { Product } from '../entities/product/productTypes';
import productRepository from '../entities/product/productRepository';

describe('Test products', () => {
    let user1: UserInfoWithToken;
    let user2: UserInfoWithToken;
    let prod1: Product;
    let prod2: Product;

    beforeAll(async() => {
        user1 = await createUser({
            name: 'testingUser4',
            email: 'user4@gmail.com',
            password: '123456',
            isAdmin: true,
        });

        user2 = await createUser({
            name: 'testingUser5',
            email: 'user5@gmail.com',
            password: '123456',
        });

        prod1 = await createProduct({
            name: 'Computer',
            description: 'High-quality gaming computer',
            category: 'Gaming',
            image: 'PCURL',
            price: 2500,
            stock: 3,
        }, user1.token);

        prod2 = await createProduct({
            name: 'Bulb',
            description: 'Bulb with over 10.000 hours of lifetime',
            category: 'Electronics',
            image: 'BulbURL',
            price: 25,
            stock: 75,
        }, user1.token);
    });

    describe('Create product', () => {
        const testCases = [
            {
                title: 'Create a valid product: (201)',
                productData: {
                    name: 'Computer',
                    description: 'High-quality gaming computer',
                    category: 'Gaming',
                    image: 'PCURL',
                    price: 2500,
                    stock: 3,                    
                },
                getToken: () => user1.token,
                expected: 201,
            },
            {
                title: 'Create an invalid product: (400)',
                productData: {
                    name: 'Computer',
                    description: 'High-quality gaming computer',
                    category: 'Gaming',
                    image: 'PCURL',
                    price: 2500,
                    stock: -3,                    
                },
                getToken: () => user1.token,
                expected: 400,
            },
            {
                title: 'Create a valid product being user: (403)',
                productData: {
                    name: 'Computer',
                    description: 'High-quality gaming computer',
                    category: 'Gaming',
                    image: 'PCURL',
                    price: 2500,
                    stock: 3,                    
                },
                getToken: () => user2.token,
                expected: 403,
            },
            {
                title: 'Invalid token: (403)',
                productData: {
                    name: 'Computer',
                    description: 'High-quality gaming computer',
                    category: 'Gaming',
                    image: 'PCURL',
                    price: 2500,
                    stock: 3,                    
                },
                getToken: () => invalidToken(),
                expected: 403,
            },
        ];

        it.each(testCases)(
            "should create a product. %s", async({ productData, getToken, expected}) => {
                await testAllCases({
                    method: 'post',
                    url: '/api/products/create',
                    body: productData,
                    getToken,
                    expected,
                })
            }
        );
    });

    describe('Find a product', () => {
        const testCases = [
            {
                title: 'Find a valid product: (200)',
                getProductId: () => prod1.id,
                getToken: () => user1.token,
                expected: 200,
            },
            {
                title: 'Get a product without token (no token needed): (200)',
                getProductId: () => prod2.id,
                getToken: () => null,
                expected: 200,
            },
            {
                title: 'Get a product that does not exist: (404)',
                getProductId: () => invalidId(),
                getToken: () => user1.token,
                expected: 404,
            },
        ];

        it.each(testCases)(
            "should return a product. %s", async({ getProductId, getToken, expected}) => {
                let productId: string | undefined;
                if (getProductId) productId = getProductId();
                await testAllCases({
                    method: 'get',
                    url: `/api/products/find/${productId}`,
                    getToken,
                    expected,
                })
            }
        );        
    });

    describe('Update a product', () => {
        const testCases = [
            {
                title: 'Correctly update a product: (200)',
                getProductID: () => prod1.id,
                productData: {
                    name: 'Computer',
                    description: 'Medium-quality gaming computer',
                    category: 'Gaming',
                    image: 'PCURL',
                    price: 1750,
                    stock: 3,                    
                },
                getToken: () => user1.token,
                expected: 200,
            },
            {
                title: 'Update a product with invalid values: (400)',
                getProductID: () => prod1.id,
                productData: {
                    name: 'Computer',
                    description: 'Medium-quality gaming computer',
                    category: true,
                    image: 'PCURL',
                    price: [],
                    stock: -10,                
                },
                getToken: () => user1.token,
                expected: 400,
            },
            {
                title: 'Update an inexistent product: (404)',
                getProductID: () => invalidId(),
                productData: {
                    name: 'Computer',
                    description: 'Medium-quality gaming computer',
                    category: 'Gaming',
                    image: 'PCURL',
                    price: 1750,
                    stock: 3,            
                },
                getToken: () => user1.token,
                expected: 404,
            },
            {
                title: 'Update a product being a user: (403)',
                getProductID: () => prod1.id,
                productData: {
                    name: 'Computer',
                    description: 'Medium-quality gaming computer',
                    category: 'Gaming',
                    image: 'PCURL',
                    price: 1750,
                    stock: 3,            
                },
                getToken: () => user2.token,
                expected: 403,
            },
            {
                title: 'Invalid token: (403)',
                getProductID: () => prod1.id,
                productData: {
                    name: 'Computer',
                    description: 'Medium-quality gaming computer',
                    category: 'Gaming',
                    image: 'PCURL',
                    price: 1750,
                    stock: 3,            
                },
                getToken: () => invalidToken(),
                expected: 403,
            },
        ];

        it.each(testCases)(
            "should update a product. %s", async({ getProductID, productData, getToken, expected}) => {
                let productID;
                if (getProductID) productID = getProductID();
                await testAllCases({
                    method: 'patch',
                    url: `/api/products/update/${productID}`,
                    body:  {...productData},
                    getToken,
                    expected,
                });
            }
        );   
    });

    describe('Delete a product', () => {
        const testCases = [
            {
                title: 'Correctly delete a product: (200)',
                getProductID: () => prod1.id,
                getToken: () => user1.token,
                expected: 200,
            },
            {
                title: 'Delete an inexistent product: (404)',
                getProductID: () => invalidId(),
                getToken: () => user1.token,
                expected: 404,
            },
            {
                title: 'Delete a product while being a user: (403)',
                getProductID: () => prod2.id,
                getToken: () => user2.token,
                expected: 403,
            },
            {
                title: 'Delete a product without token: (401)',
                getProductID: () => prod2.id,
                getToken: () => null,
                expected: 401,
            },
        ];

        it.each(testCases)(
            "should delete a product. %s", async({ getProductID, getToken, expected}) => {
                let productID;
                if (getProductID) productID = getProductID();
                await testAllCases({
                    method: 'patch',
                    url: `/api/products/delete/${productID}`,
                    getToken,
                    expected,
                });
            }
        );        
    });
});