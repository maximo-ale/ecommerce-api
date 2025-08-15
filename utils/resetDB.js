const Review = require("../models/Review");
const User = require("../models/User");
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const Product = require('../models/Product');

const resetDB = async() => {
    await Review.deleteMany();
    await User.deleteMany();
    await Cart.deleteMany();
    await Coupon.deleteMany();
    await Order.deleteMany();
    await Product.deleteMany();
}

module.exports = resetDB;