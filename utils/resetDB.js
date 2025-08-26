import Review from "../entities/review/Review.js";
import User from "../entities/user/User.js";
import Cart from '../entities/cart/Cart.js';
import Coupon from '../entities/coupon/Coupon.js';
import Order from '../entities/order/Order.js';
import Product from '../entities/product/Product.js';
import productRepository from "../entities/product/productRepository.js";
import userRepository from "../entities/user/userRepository.js";

const resetDB = async() => {
    await Review.deleteMany();
    await User.deleteMany();
    await Cart.deleteMany();
    await Coupon.deleteMany();
    await Order.deleteMany();
    await Product.deleteMany();
}

export default resetDB;