import reviewService from './reviewService';
import type { Request, Response } from 'express';

class ReviewController{
    async createReview(req: Request, res: Response){
        const newReview = await reviewService.createReview(req.body, req.userId!, req.params.productId);

        res.status(201).json({
            message: 'Review created successfully',
            review: newReview,
        });
    }

    async updateReview(req: Request, res: Response){
        const updatedReview = await reviewService.updateReview(req.body, req.userId!, req.params.reviewId);

        res.status(200).json({
            message: 'Review updated successfully',
            updatedReview,
        });
    }

    async getProductReviews(req: Request, res: Response){
        const productReviews = await reviewService.getProductReviews(req.params.productId);
        res.status(200).json({
            message: 'All reviews found successfully',
            reviews: productReviews,
        });
    }

    async getUserReviews(req: Request, res: Response){
        const userReviews = await reviewService.getUserReviews(req.params.userId);

        res.status(200).json({
            message: 'All reviews found successfully',
            userReviews,
        });
    }
    
    async deleteReview(req: Request, res: Response){
        const deletedReview = await reviewService.deleteReview(req.userId!, req.params.reviewId);

        res.status(200).json({
            message: 'Review deleted successfully',
            deletedReview,
        });
    }
}

export default new ReviewController;