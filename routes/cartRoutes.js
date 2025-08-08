const express = require('express');
const { getCart, addProductToCart, modifyQuantity, removeFromCart, clearCart, applyDiscount, removeCurrentCoupon } = require('../controllers/cartController');
const { auth } = require('../middlewares/authMiddleware');
const router = express.Router();

const {body, param, query} = require('express-validator');
const { validateRequest } = require('../middlewares/validateRequest');

router.get('/', auth, getCart);

router.post('/add',
    body('productId').isMongoId().withMessage('Invalid ID'),
    body('quantity').toInt().isInt({min: 1}).withMessage('Invalid quantity value'),
    validateRequest, auth, addProductToCart);

router.patch('/modifyQuantity/:productId',
    param('productId').isMongoId().withMessage('Invalid ID'),
    body('quantity').toInt().isInt({min: 1}).withMessage('Invalid quantity value'),
    validateRequest, auth, modifyQuantity);

router.delete('/removeProduct/:productId',
    param('productId').isMongoId().withMessage('Invalid ID'),
    validateRequest, auth, removeFromCart);

router.delete('/clear', auth, clearCart);

router.post('/addCoupon',
    body('couponCode').isString().withMessage("Code must be a string").bail().trim().notEmpty().withMessage("Invalid code value"),
    validateRequest, auth, applyDiscount);

router.delete('/removeCoupon', auth, removeCurrentCoupon);

module.exports = router;