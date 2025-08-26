import './testSetup.js';
import { getEntityID, invalidId, invalidToken, testAllCases } from './testHelper';
import { createProduct, createUser } from '../utils/createEntitiesForTesting.js';

describe('Test products', () => {
    let user1;
    let user2;
    let prod1;
    let prod2;

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
            price: '2500',
            stock: '3',
        }, user1.token);

        prod2 = await createProduct({
            name: 'Bulb',
            description: 'Bulb with over 10.000 hours of lifetime',
            category: 'Electronics',
            image: 'BulbURL',
            price: '25',
            stock: '75',
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
                    price: '2500',
                    stock: '3',                    
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
                    price: '2500',
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
                    price: '2500',
                    stock: '3',                    
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
                    price: '2500',
                    stock: '3',                    
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
                    body: {...productData},
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
                getProductID: () => getEntityID(prod1),
                getToken: () => user1.token,
                expected: 200,
            },
            {
                title: 'Get a product without token (no token needed): (200)',
                getProductID: () => getEntityID(prod2),
                getToken: () => null,
                expected: 200,
            },
            {
                title: 'Get a product that does not exist: (404)',
                getProductID: () => invalidId(),
                getToken: () => user1.token,
                expected: 404,
            },
        ];

        it.each(testCases)(
            "should return a product. %s", async({ getProductID, getToken, expected}) => {
                let productID;
                if (getProductID) productID = getProductID();
                await testAllCases({
                    method: 'get',
                    url: `/api/products/find/${productID}`,
                    getToken,
                    expected,
                })
            }
        );        
    });

    describe('Modify a product', () => {
        const testCases = [
            {
                title: 'Correctly modify a product: (200)',
                getProductID: () => getEntityID(prod1),
                productData: {
                    name: 'Computer',
                    description: 'Medium-quality gaming computer',
                    category: 'Gaming',
                    image: 'PCURL',
                    price: '1750',
                    stock: '3',                    
                },
                getToken: () => user1.token,
                expected: 200,
            },
            {
                title: 'Modify a product with invalid values: (400)',
                getProductID: () => getEntityID(prod1),
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
                title: 'Modify an inexistent product: (404)',
                getProductID: () => invalidId(),
                productData: {
                    name: 'Computer',
                    description: 'Medium-quality gaming computer',
                    category: 'Gaming',
                    image: 'PCURL',
                    price: '1750',
                    stock: '3',            
                },
                getToken: () => user1.token,
                expected: 404,
            },
            {
                title: 'Modify a product being a user: (403)',
                getProductID: () => getEntityID(prod1),
                productData: {
                    name: 'Computer',
                    description: 'Medium-quality gaming computer',
                    category: 'Gaming',
                    image: 'PCURL',
                    price: '1750',
                    stock: '3',            
                },
                getToken: () => user2.token,
                expected: 403,
            },
            {
                title: 'Invalid token: (403)',
                getProductID: () => getEntityID(prod1),
                productData: {
                    name: 'Computer',
                    description: 'Medium-quality gaming computer',
                    category: 'Gaming',
                    image: 'PCURL',
                    price: '1750',
                    stock: '3',            
                },
                getToken: () => invalidToken(),
                expected: 403,
            },
        ];

        it.each(testCases)(
            "should modify a product. %s", async({ getProductID, productData, getToken, expected}) => {
                let productID;
                if (getProductID) productID = getProductID();
                await testAllCases({
                    method: 'patch',
                    url: `/api/products/modify/${productID}`,
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
                getProductID: () => getEntityID(prod1),
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
                getProductID: () => getEntityID(prod2),
                getToken: () => user2.token,
                expected: 403,
            },
            {
                title: 'Delete a product without token: (401)',
                getProductID: () => getEntityID(prod2),
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