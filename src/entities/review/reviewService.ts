import { BadRequestError, NotFoundError, NotAuthorizedError } from '../../utils/errors';
import reviewRepository from './reviewRepository';
import orderRepository from '../order/orderRepository';
import productRepository from '../product/productRepository';
import userRepository from '../user/userRepository';
import { CreateReview, Review, UpdateReview } from './reviewTypes';
import { Product } from '../product/productTypes';
import { User } from '../user/userTypes';

class ReviewService{
    async createReview(data: CreateReview, userId: string, productId: string): Promise<Review>{
        const {rating, comment} = data;

        const product: Product | null = await productRepository.findProductById(productId);

        if (!product){
            throw new NotFoundError('Product not found');
        }
        
        // Check the user has bought the product before creating a review of it
        const userOrder: boolean = await orderRepository.getBoughtProduct(userId, productId);
        if (!userOrder){
            throw new NotAuthorizedError('Cannot create a review of a product you have not bought yet');
        }

        // Check if the user hasn't already made a review of that object
        const possibleReview: Review | null = await reviewRepository.findUserReview(userId, productId);
        if (possibleReview){
            throw new BadRequestError('You cannot create 2 reviews for the same product. Try updating your review');
        }

        const newReview: Review = await reviewRepository.createReview({
            rating,
            comment,
        }, productId, userId);

        return newReview;
    }

    async updateReview(data: UpdateReview, userId: string, reviewId: string): Promise<Review>{
        const review: Review | null = await reviewRepository.findById(reviewId);
        if (!review){
            throw new NotFoundError('Review not found');
        }

        if (!(review.user.id === userId)){
            throw new BadRequestError(`You cannot update other user's review`);
        }

        const updatedReview = await reviewRepository.updateReview(reviewId, data);

        return updatedReview;
    }

    async getProductReviews(productId: string): Promise<Review[]>{
        const product: Product | null = await productRepository.findProductById(productId);

        if (!product){
            throw new NotFoundError('Product not found');
        }

        const productReviews: Review[] = await reviewRepository.getProductReviews(productId);

        return productReviews;
    }

    async getUserReviews(userId: string): Promise<Review[]>{
        const user: User | null = await userRepository.findUserById(userId);

        if (!user){
            throw new NotFoundError('User not found');
        }

        const userReviews: Review[] = await reviewRepository.getUserReviews(userId);

        return userReviews;
    }
    
    async deleteReview(userId: string, reviewId: string): Promise<Review>{
        const review = await reviewRepository.findById(reviewId);

        if (!review){
            throw new NotFoundError('Review not found');
        }

        const user: User | null = await userRepository.findUserById(userId);

        if (!(review.user.id === userId) && !user!.isAdmin){
            throw new NotAuthorizedError('You are not authorized to delete this review');
        }

        const deletedReview = await reviewRepository.deleteReview(reviewId);

        return deletedReview;
    }
}

export default new ReviewService;