import express from 'express';
const router = express.Router();

import cartController from './cartController';
import { auth } from '../../middlewares/authMiddleware';

import validate from '../../middlewares/validateRequest';
import { addCouponSchema, addProductToCartSchema, updateQuantitySchema } from './cartSchema';
import { productIdSchema } from '../../utils/zod/idSchema';

router.get('/', auth, cartController.getCart);

router.post('/add',
    validate(addProductToCartSchema, 'body'),
    auth,
    cartController.addProductToCart);

router.patch('/items/:productId',
    validate(productIdSchema, 'params'), validate(updateQuantitySchema, 'body'),
    auth,
    cartController.updateQuantity);

router.delete('/items/:productId',
    validate(productIdSchema, 'params'),
    auth,
    cartController.removeFromCart);

router.delete('/clear', auth, cartController.clearCart);

router.post('/add-coupon',
    validate(addCouponSchema, 'body'),
    auth,
    cartController.applyDiscount);

router.delete('/remove-coupon', auth, cartController.removeCurrentCoupon);

export default router;