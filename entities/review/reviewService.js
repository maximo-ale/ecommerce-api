import { BadRequestError, NotFoundError, NotAuthorizedError } from '../../utils/errors.js';
import reviewRepository from './reviewRepository.js';
import orderRepository from '../order/orderRepository.js';
import productRepository from '../product/productRepository.js';
import userRepository from '../user/userRepository.js';

class ReviewService{
    async createReview(data, userId, productId){
        const {rating, comment} = data;

        const userOrder = await orderRepository.getPaidObjects(userId, productId);
        if (!userOrder){
            throw new NotAuthorizedError('Cannot create a review of a product you have not bought yet');
        }

        const possibleReview = await reviewRepository.findUserReview(userId, productId);
        if (possibleReview){
            throw new BadRequestError('You cannot create 2 reviews for the same product. Try modifying your review');
        }

        const newReview = await reviewRepository.createReview({
            product: productId,
            user: userId,
            rating,
            comment,
        });

        return newReview;
    }

    async modifyReview(data, userId, reviewId){
        const {user, product} = data;

        if (user || product) {
            throw new BadRequestError('Cannot modify the user or the product of the review');
        }

        const review = await reviewRepository.findById(reviewId);
        if (!review){
            throw new NotFoundError('Review not found');
        }

        if (!review.user.equals(userId)){
            throw new BadRequestError(`You cannot modify other user's review`);
        }

        const updatedReview = await reviewRepository.modifyReview(reviewId, data);

        return updatedReview;
    }

    async getProductReviews(productId){
        const product = await productRepository.findProductById(productId);

        if (!product){
            throw new NotFoundError('Product not found');
        }

        const productReviews = await reviewRepository.getProductReviews(productId);

        return productReviews;
    }

    async getUserReviews(userId){
        const user = await userRepository.findUserById(userId);

        if (!user){
            throw new NotFoundError('User not found');
        }

        const userReviews = await reviewRepository.getUserReviews({userId: user._id});

        return userReviews;
    }
    
    async deleteReview(userId, reviewId){
        const review = await reviewRepository.findById(reviewId);

        if (!review){
            throw new NotFoundError('Review not found');
        }

        const user = await userRepository.findUserById(userId);

        if (!review.user.equals(userId) && !user.isAdmin){
            throw new NotAuthorizedError('You are not authorized to delete this review');
        }

        const deletedReview = await reviewRepository.deleteReview({reviewId});

        return deletedReview;
    }
}

export default new ReviewService;