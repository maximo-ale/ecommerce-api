import express from 'express';
const router = express.Router();

import userController from './userController';

import validate from '../../middlewares/validateRequest';
import { userLoginSchema, userRegisterSchema } from './userSchema';

router.post('/register',
    validate(userRegisterSchema, 'body'),
    userController.register);

router.post('/login',
    validate(userLoginSchema, 'body'),
    userController.login);

export default router;