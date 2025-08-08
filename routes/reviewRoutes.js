const express = require('express');
const router = express.Router();
const { createReview, modifyReview, getProductReviews, getUserReviews, deleteReview, getAllReviews } = require('../controllers/reviewController');
const { auth, adminOnly } = require('../middlewares/authMiddleware');

const {body, param, query} = require('express-validator');
const { validateRequest } = require ('../middlewares/validateRequest');

router.post('/create/:productId',
    param('productId').isMongoId().withMessage("Invalid ID"),
    body('comment').isString().withMessage("Comment must be a string").bail().trim().notEmpty().withMessage("Invalid comment value"),
    body('rating').toInt().isInt({min: 1, max: 5}).withMessage("Invalid rating value. Rating must be between 1-5"),
    validateRequest, auth, createReview);

router.patch('/modify/:reviewId',
    param('reviewId').isMongoId().withMessage("Invalid ID"),
    body('comment').isString().withMessage("Comment must be a string").bail().trim().notEmpty().withMessage("Invalid comment value"),
    body('rating').toInt().isInt({min: 1, max: 5}).withMessage("Invalid rating value. Rating must be between 1-5"),
    validateRequest, auth, modifyReview);

router.get('/:productId',
    param('productId').isMongoId().withMessage("Invalid ID"),
    validateRequest, getProductReviews);

router.get('/userReviews/:userId',
    param('userId').isMongoId().withMessage("Invalid ID"),
    validateRequest, auth, getUserReviews);

router.delete('/delete/:reviewId',
    param('reviewId').isMongoId().withMessage("Invalid ID"),
    validateRequest, auth, deleteReview);

router.get('/', auth, adminOnly, getAllReviews);

module.exports = router;