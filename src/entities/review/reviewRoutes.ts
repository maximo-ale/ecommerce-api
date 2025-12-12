import express from 'express';
const router = express.Router();

import reviewController from './reviewController';
import { auth, adminOnly } from '../../middlewares/authMiddleware';

import validate from '../../middlewares/validateRequest';
import { productIdSchema, reviewIdSchema, userIdSchema } from '../../utils/zod/idSchema';
import { updateProductSchema } from '../product/productSchema';
import { createReviewSchema, updateReviewSchema } from './reviewSchema';

router.post('/:productId',
    validate(productIdSchema, 'params'), validate(createReviewSchema, 'body'),
    auth,
    reviewController.createReview);

router.patch('/:reviewId',
    validate(reviewIdSchema, 'params'), validate(updateReviewSchema, 'body'),
    auth,
    reviewController.updateReview);

router.get('/reviews/:productId',
    validate(productIdSchema, 'params'),
    reviewController.getProductReviews);

router.get('/user-reviews/:userId',
    validate(userIdSchema, 'params'),
    auth,
    reviewController.getUserReviews);

router.delete('/:reviewId',
    validate(reviewIdSchema, 'params'),
    auth,
    reviewController.deleteReview);

export default router;