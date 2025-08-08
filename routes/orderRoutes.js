const express = require('express');
const {createOrder, getOrderDetails, getOrderHistory, getAll, modifyState} = require('../controllers/orderController');
const router = express.Router();
const { auth, adminOnly } = require('../middlewares/authMiddleware');

const {body, param, query} = require('express-validator');
const { validateRequest } = require('../middlewares/validateRequest');
const allowedStatuses = ['pending', 'payed', 'sent', 'cancelled'];

router.post('/create', auth, createOrder);

router.get('/details/:orderId',
    param('orderId').isMongoId().withMessage("Invalid ID"),
    validateRequest, auth, getOrderDetails);

router.get('/history', auth, getOrderHistory);

router.get('/all', auth, adminOnly, getAll);

router.patch('/state/:orderId',
    param('orderId').isMongoId().withMessage("Invalid ID"),
    body('status')
    .isString().withMessage("Status must be a string").bail().trim().notEmpty()
    .isIn(allowedStatuses).withMessage(`Only the next values are accepted: ${allowedStatuses}`),
    validateRequest, auth, adminOnly, modifyState);

module.exports = router;