import Review from './Review.js';

class ReviewRepository{
    async createReview(data){
        const newReview = new Review(data);
        return await newReview.save();
    }

    async findById(reviewId){
        return await Review.findById(reviewId);
    }

    async getReviewById(reviewId){
        return await Review.findById(reviewId);
    }

    async findUserReview(userId, productId){
        return await Review.findOne({user: userId, product: productId});
    }

    async getProductReviews(productId){
        return await Review.find({product: productId});
    }

    async getUserReviews({userId}){
        return await Review.find({user: userId});
    }

    async modifyReview(reviewId, data){
        return await Review.findByIdAndUpdate(
            reviewId,
            {$set: data},
            {new: true, runValidators: true},
        );
    }

    async deleteReview({reviewId}){
        return await Review.findByIdAndDelete(reviewId);
    }
}

export default new ReviewRepository;