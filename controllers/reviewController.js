const Order = require("../models/Order");
const Product = require("../models/Product");
const Review = require("../models/Review");
const User = require("../models/User");

exports.createReview = async (req, res) => {
    try {
        const {rating, comment} = req.body;

        const userOrder = await Order.findOne({user: req.userId, status: 'payed', 'products.product': req.params.productId});
        if (!userOrder){
            return res.status(403).json({message: 'Cannot create a review of a product before buying it'});
        }

        const possibleReview = await Review.findOne({user: req.userId, product: req.params.productId});
        if (possibleReview){
            return res.status(400).json({message: 'You cannot create 2 reviews for the same product. Try modifying your review'});
        }

        const newReview = new Review({
            product: req.params.productId,
            user: req.userId,
            rating,
            comment,
        });

        await newReview.save();

        res.status(201).json({
            message: 'Review created successfully',
            review: newReview,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Internal server error'});
    }
}

exports.modifyReview = async (req, res) => {
    try {
        const {user, product} = req.body;

        if (user || product) {
            return res.status(400).json({message: 'Cannot modify the user or the product of the review'});
        }

        const review = await Review.findById(req.params.reviewId);
        if (review.user !== req.userId){
            return res.status(400).json({message: `You cannot modify other user's review`});
        }

        const updatedReview = await Review.findByIdAndUpdate(
            req.params.reviewId,
            {$set: req.body},
            {new: true, runValidators: true},
        );

        if (!updatedReview){
            return res.status(404).json({message: 'Review not found'});
        }

        res.status(200).json({
            message: 'Review updated successfully',
            updatedReview,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Internal server error'});
    }
}
exports.getProductReviews = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);

        if (!product){
            return res.status(404).json({message: 'Product not found'});
        }

        const productReviews = await Review.find({product: product._id});

        if (productReviews.length === 0){
            return res.status(400).json({message: 'Product has no reviews'});
        }

        res.status(200).json({
            message: 'All reviews found successfully',
            reviews: productReviews,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Internal server error'});
    }
}

exports.getUserReviews = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user){
            return res.status(404).json({message: 'User not found'});
        }

        const userReviews = await Review.find({user: user._id});

        if (userReviews.length === 0){
            return res.status(400).json({message: 'User has not made any review yet'});
        }

        res.status(200).json({
            message: 'All reviews found successfully',
            userReviews,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Internal server error'});
    }
}

exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);

        if (!review){
            return res.status(404).json({message: 'Review not found'});
        }

        const user = await User.findById(req.userId);

        if (!review.user.equals(req.userId) && !user.isAdmin){
            return res.status(403).json({message: 'You are not authorized to delete this review'});
        }

        const deletedReview = await Review.findByIdAndDelete(req.params.reviewId);

        res.status(200).json({
            message: 'Review deleted successfully',
            deletedReview,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Internal server error'});
    }
}