import './testSetup';
import { testAllCases } from './testHelper';

describe("User testing", () => {
    describe("Register", () => {
        const testCases = [
            {
                title: 'Valid values: (201)',
                user: {name: 'user1', email: 'abcd@gmail.com', password: '1234567'},
                expected: 201,
            },
            {
                title: 'Repeated email: (400)',
                user: {name: 'user2', email: 'abcd@gmail.com', password: '1234567',},
                expected: 400,
            },
            {
                title: 'Name cannot be a boolean: (400)',
                user: {name: true, email: 'abcde@gmail.com', password: '1234567',},
                expected: 400,
            },
            {
                title: 'Invalid email: (400)',
                user: {name: 'user3', email: 'wrongEmail', password: '1234567',},
                expected: 400,
            },
            {
                title: 'Short password: (400)',
                user: {name: 'user4', email: 'user4@gmail.com', password: '1',},
                expected: 400,
            },
            {
                title: 'No body: (400)',
                expected: 400,
            },
        ];

        it.each(testCases)(
            'should register a user. %s', async({ user, expected }) => {
                await testAllCases({
                    method: 'post',
                    url: '/api/auth/register',
                    body: user,
                    expected,
                });
            });        
    });

    describe('Login', () => {
        const testCases = [
            {
                title: 'Valid values: (200)',
                user: {name: 'user1', email: 'abcd@gmail.com', password: '1234567'},
                expected: 200,
            },
            {
                title: 'No email provided (should work with user only): (200)',
                user: {name: 'user1', password: '1234567'},
                expected: 200,
            },
            {
                title: 'Invalid name and email fields: (400)',
                user: {name: true, email: {}, password: '1234567'},
                expected: 400,
            },
            {
                title: 'Invalid password field: (400)',
                user: {name: 'user1', email: 'abcd@gmail.com', password: []},
                expected: 400,
            },
            {
                title: 'Right user wrong password: (400)',
                user: {name: 'user1', email: 'abcd@gmail.com', password: '2134567'},
                expected: 400,
            },
            {
                title: 'Not found user: (404)',
                user: {name: 'user10', email: 'abcde@gmail.com', password: '1234567'},
                expected: 404,
            },
            {
                title: 'No body: (400)',
                expected: 400,
            },
        ];

        it.each(testCases)(
            'it should login a user. %s', async({ user, expected }) => {
                await testAllCases({
                    method: 'post',
                    url: '/api/auth/login',
                    body: user,
                    expected,
                });
            }
        );
    });
});