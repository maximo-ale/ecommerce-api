import express from 'express';
const router = express.Router();

import orderController from './orderController';
import { auth, adminOnly } from '../../middlewares/authMiddleware';

import validate from '../../middlewares/validateRequest';
import { orderIdSchema } from '../../utils/zod/idSchema';
import { orderStatusSchema } from './orderSchema';
import { checkoutLimit } from '../../middlewares/rate-limit';
const allowedStatuses = ['pending', 'paid', 'sent', 'cancelled'];

router.post('/create', auth, checkoutLimit, orderController.createOrder);

router.get('/details/:orderId',
    validate(orderIdSchema, 'params'),
    auth,
    orderController.getOrderDetails);

router.get('/history', auth, orderController.getOrderHistory);

router.get('/all', auth, adminOnly, orderController.getAll);

router.patch('/status/:orderId',
    validate(orderIdSchema, 'params'), validate(orderStatusSchema, 'body'),
    auth, adminOnly,
    orderController.updateStatus);

export default router;