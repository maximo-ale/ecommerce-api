const express = require('express');
const router = express.Router();
const { createCoupon, getAllCoupons, deleteAll } = require('../controllers/couponRoutes');
const { auth, adminOnly } = require('../middlewares/authMiddleware');

const {body, param, query} = require('express-validator');
const { validateRequest } = require ('../middlewares/validateRequest');

router.post('/create',
    body('code').isString().withMessage("Code must be a string").bail().trim().notEmpty().withMessage("Invalid code value"),
    body('maxUses').toInt().isInt({min: 1}).withMessage('Invalid max uses value'),
    body('maxDiscountAmount').optional().toInt().isInt({min: 1}).withMessage('Invalid max discount amount value'),
    body('discountPercent').toInt().isInt({min: 1, max: 100}).withMessage("Invalid discount percent value. It must be a number between 1-100"),
    body('expiresAt').isISO8601().withMessage('Invalid expiration time value').toDate(),
    validateRequest, auth, adminOnly, createCoupon);

router.get('/', auth, adminOnly, getAllCoupons);

module.exports = router;