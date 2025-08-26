import express from 'express';
const router = express.Router();

import userController from './userController.js';

import { body, param, query } from 'express-validator';
import validateRequest from '../../middlewares/validateRequest.js';

router.post('/register',
    body('name').isString().withMessage('Name must be a string').bail().trim().notEmpty().withMessage('Invalid name'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password').isString().withMessage('Password must be a string').bail().trim().isLength({min: 4}).withMessage('Password must be at least 4 characters long'),
    body('isAdmin').optional().isBoolean().withMessage('Invalid admin value'),
    validateRequest, userController.register);

router.post('/login',
    body('name').optional().trim().notEmpty().withMessage('Invalid name'),
    body('email').optional().isEmail().withMessage('Invalid email'),
    body('password').isString().trim().notEmpty().withMessage('Invalid password'),
    validateRequest, userController.login);

export default router;