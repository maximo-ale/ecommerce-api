import express from 'express';
const router = express.Router();

import couponController from './couponController.js';
import { auth, adminOnly } from '../../middlewares/authMiddleware.js';

import {body, param, query} from 'express-validator';
import validateRequest from '../../middlewares/validateRequest.js';

router.post('/create',
    body('code').isString().withMessage("Code must be a string").bail().trim().notEmpty().withMessage("Invalid code value"),
    body('maxUses').toInt().isInt({min: 1}).withMessage('Invalid max uses value'),
    body('maxDiscountAmount').optional().toInt().isInt({min: 1}).withMessage('Invalid max discount amount value'),
    body('discountPercent').toInt().isInt({min: 1, max: 100}).withMessage("Invalid discount percent value. It must be a number between 1-100"),
    body('expiresAt').isISO8601().withMessage('Invalid expiration time value').toDate(),
    validateRequest, auth, adminOnly, couponController.createCoupon);

router.get('/', auth, adminOnly, couponController.getAllCoupons);

router.get('/delete/:id',
    body('couponId').isMongoId().withMessage('Invalid ID'),
    validateRequest, auth, adminOnly, couponController.deleteCoupon);

export default router;