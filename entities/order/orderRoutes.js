import express from 'express';
const router = express.Router();

import orderController from './orderController.js';
import { auth, adminOnly } from '../../middlewares/authMiddleware.js';

import {body, param, query} from 'express-validator';
import validateRequest from '../../middlewares/validateRequest.js';
const allowedStatuses = ['pending', 'payed', 'sent', 'cancelled'];

router.post('/create', auth, orderController.createOrder);

router.get('/details/:orderId',
    param('orderId').isMongoId().withMessage("Invalid ID"),
    validateRequest, auth, orderController.getOrderDetails);

router.get('/history', auth, orderController.getOrderHistory);

router.get('/all', auth, adminOnly, orderController.getAll);

router.patch('/state/:orderId',
    param('orderId').isMongoId().withMessage("Invalid ID"),
    body('status')
    .isString().withMessage("Status must be a string").bail().trim().notEmpty()
    .isIn(allowedStatuses).withMessage(`Only the next values are accepted: ${allowedStatuses}`),
    validateRequest, auth, adminOnly, orderController.modifyState);

export default router;