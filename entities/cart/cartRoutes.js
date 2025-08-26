import express from 'express';
const router = express.Router();

import cartController from './cartController.js';
import { auth } from '../../middlewares/authMiddleware.js';

import {body, param, query} from 'express-validator';
import validateRequest from '../../middlewares/validateRequest.js';

router.get('/', auth, cartController.getCart);

router.post('/add',
    body('productId').isMongoId().withMessage('Invalid ID'),
    body('quantity').toInt().isInt({min: 1}).withMessage('Invalid quantity value'),
    validateRequest, auth, cartController.addProductToCart);

router.patch('/modifyQuantity/:productId',
    param('productId').isMongoId().withMessage('Invalid ID'),
    body('quantity').toInt().isInt({min: 1}).withMessage('Invalid quantity value'),
    validateRequest, auth, cartController.modifyQuantity);

router.delete('/removeProduct/:productId',
    param('productId').isMongoId().withMessage('Invalid ID'),
    validateRequest, auth, cartController.removeFromCart);

router.delete('/clear', auth, cartController.clearCart);

router.post('/addCoupon',
    body('code').isString().withMessage("Code must be a string").bail().trim().notEmpty().withMessage("Invalid code value"),
    validateRequest, auth, cartController.applyDiscount);

router.delete('/removeCoupon', auth, cartController.removeCurrentCoupon);

export default router;