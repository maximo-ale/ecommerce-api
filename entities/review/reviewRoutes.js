import express from 'express';
const router = express.Router();

import reviewController from './reviewController.js';
import { auth, adminOnly } from '../../middlewares/authMiddleware.js';

import {body, param, query} from 'express-validator';
import validateRequest from '../../middlewares/validateRequest.js';

router.post('/create/:productId',
    param('productId').isMongoId().withMessage("Invalid ID"),
    body('comment').isString().withMessage("Comment must be a string").bail().trim().notEmpty().withMessage("Invalid comment value"),
    body('rating').toInt().isInt({min: 1, max: 5}).withMessage("Invalid rating value. Rating must be between 1-5"),
    validateRequest, auth, reviewController.createReview);

router.patch('/modify/:reviewId',
    param('reviewId').isMongoId().withMessage("Invalid ID"),
    body('comment').isString().withMessage("Comment must be a string").bail().trim().notEmpty().withMessage("Invalid comment value"),
    body('rating').toInt().isInt({min: 1, max: 5}).withMessage("Invalid rating value. Rating must be between 1-5"),
    validateRequest, auth, reviewController.modifyReview);

router.get('/:productId',
    param('productId').isMongoId().withMessage("Invalid ID"),
    validateRequest, reviewController.getProductReviews);

router.get('/userReviews/:userId',
    param('userId').isMongoId().withMessage("Invalid ID"),
    validateRequest, auth, reviewController.getUserReviews);

router.delete('/delete/:reviewId',
    param('reviewId').isMongoId().withMessage("Invalid ID"),
    validateRequest, auth, reviewController.deleteReview);

export default router;