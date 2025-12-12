import express from 'express';
const router = express.Router();

import couponController from './couponController';
import { auth, adminOnly } from '../../middlewares/authMiddleware';

import validate from '../../middlewares/validateRequest';
import { createCouponSchema } from './couponSchema';
import { couponIdSchema } from '../../utils/zod/idSchema';

router.post('/',
    validate(createCouponSchema, 'body'),
    auth, adminOnly,
    couponController.createCoupon);

router.get('/', auth, adminOnly, couponController.getAllCoupons);

router.get('/delete/:couponId',
    validate(couponIdSchema, 'params'),
    auth, adminOnly,
    couponController.deleteCoupon);

export default router;