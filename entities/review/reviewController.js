import reviewService from './reviewService.js';

class ReviewController{
    async createReview(req, res){
        const newReview = await reviewService.createReview(req.body, req.userId, req.params.productId);

        res.status(201).json({
            message: 'Review created successfully',
            review: newReview,
        });
    }

    async modifyReview(req, res){
        const updatedReview = await reviewService.modifyReview(req.body, req.userId, req.params.reviewId);

        res.status(200).json({
            message: 'Review updated successfully',
            updatedReview,
        });
    }

    async getProductReviews(req, res){
        const productReviews = await reviewService.getProductReviews(req.params.productId);
        
        res.status(200).json({
            message: 'All reviews found successfully',
            reviews: productReviews,
        });
    }

    async getUserReviews(req, res){
        const userReviews = await reviewService.getUserReviews(req.params.userId);

        res.status(200).json({
            message: 'All reviews found successfully',
            userReviews,
        });
    }
    
    async deleteReview(req, res){
        const deletedReview = await reviewService.deleteReview(req.userId, req.params.reviewId);

        res.status(200).json({
            message: 'Review deleted successfully',
            deletedReview,
        });
    }
}

export default new ReviewController;