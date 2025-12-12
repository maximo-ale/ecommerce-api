import './testSetup';
import { UserInfoWithToken } from "../entities/user/userTypes";
import { createUser } from "../utils/createEntitiesForTesting";
import createTables from "../utils/tables/createTables";
import resetDB from "../utils/tables/resetDB";
import { testAllCases } from "./testHelper";
import { pool } from "./testSetup";

describe('Coupon tests', () => {
    let user1: UserInfoWithToken;
    let user2: UserInfoWithToken;
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
    });

    describe('Create coupon', () => {
        const testCases = [
            {
                title: 'Correctly create a coupon: (201)',
                getToken: () => user1.token,
                body: {
                    code: 'Test Coupon 1',
                    maxUses: 5,
                    maxDiscountAmount: 70,
                    discountPercent: 15,
                    expiresAt: new Date('2027-01-01T00:00:00'),
                },
                expected: 201
            },
            {
                title: 'Create a coupon that has an expiration time in the past: (400)',
                getToken: () => user1.token,
                body: {
                    code: 'Test Coupon 2',
                    maxUses: 3,
                    maxDiscountAmount: 20,
                    discountPercent: 25,
                    expiresAt: new Date('2020-01-01T00:00:00'),
                },
                expected: 400
            },
            {
                title: 'Create a coupon as a user: (403)',
                getToken: () => user2.token,
                body: {
                    code: 'Test Coupon 3',
                    maxUses: 4,
                    maxDiscountAmount: 120,
                    discountPercent: 10,
                    expiresAt: new Date('2027-01-01T00:00:00'),
                },
                expected: 403
            },
        ];

        it.each(testCases)(
            'should create a coupon', async({body, getToken, expected}) => {
                await testAllCases({
                    method: 'post',
                    getToken,
                    url: '/api/coupon/',
                    body,
                    expected,
                });
            }
        );
    });

    describe('Get all coupons', () => {
        const testCases = [
            {
                title: 'Correctly get all coupons: (200)',
                getToken: () => user1.token,
                expected: 200
            },
            {
                title: 'Get coupons as a user: (403)',
                getToken: () => user2.token,
                expected: 403
            },
        ];

        it.each(testCases)(
            'should create a coupon', async({getToken, expected}) => {
                await testAllCases({
                    method: 'get',
                    getToken,
                    url: '/api/coupon/',
                    expected,
                });
            }
        );
    })
});