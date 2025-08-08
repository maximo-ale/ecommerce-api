const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const Product = require('../models/Product');
const User = require('../models/User');

exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({user: req.userId});

        if (!cart){
            return res.status(404).json({message: 'Cart not found'});
        }

        res.status(200).json({
            message: 'Cart found successfully',
            cart,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Internal server error'});
    }
}

exports.addProductToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        const product = await Product.findOne({_id: productId, isDeleted: false});

        if (!product){
            return res.status(404).json({message: 'Product not found'});
        }

        // Look if user requested more products than available
        if (quantity > product.stock){
            return res.status(400).json({message: `Product does not have ${quantity} ${product.name} left`});
        }

        let cart = await Cart.findOne({user: req.userId});

        // Create a cart if user does not have one
        if (!cart) {
            cart = new Cart({
                user: req.userId,
                items: [{
                    product: product._id,
                    quantity,
                }]
            });

            await cart.save();
            
            return res.status(201).json({
                message: 'Cart created successfully',
                cart,
            });
        } else {
            // Add quantity if item already exists
            const existingItem = cart.items.find(item => item.product.equals(product._id));
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.items.push({product: productId, quantity,});
            }
        }

        await cart.save();

        res.status(200).json({
            message: 'Product added successfully',
            cart,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Internal server error'});
    }
}

exports.modifyQuantity = async (req, res) => {
    try {
        const quantity = req.body.quantity;

        const product = await Product.findById(req.params.productId);
        if (!product){
            return res.status(404).json({message: 'Product not found'});
        }

        if (quantity > product.stock){
            return res.status(400).json({message: `Product does not have ${quantity} ${product.name}/s left`});
        }

        const cart = await Cart.findOne({user: req.userId});
        if (!cart) {
            return res.status(404).json({message: 'Cart not found'});
        }

        const items = cart.items.find(i => i.product.equals(req.params.productId));
        const idx = cart.items.indexOf(items);

        if (idx === -1){
            return res.status(404).json({message: 'Item not found'});
        }

        cart.items[idx].quantity = quantity;

        await cart.save();

        res.status(200).json({
            message: 'Product updated successfully',
            cart,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Internal server error'});
    }
}

exports.removeFromCart = async (req, res) => {
    try {       
        const cart = await Cart.findOne({user: req.userId});
        if (!cart) {
            return res.status(404).json({message: 'Cart not found'});
        }

        if (!cart.items.some(item => item.product.equals(req.params.productId))){
            return res.status(400).json({message: 'Product is not in the cart'});
        }

        cart.items = cart.items.filter(i => !i.product.equals(req.params.productId));
        await cart.save();

        res.status(200).json({
            message: 'Product deleted successfully',
            cart,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Internal server error'});
    }
}

exports.clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({user: req.userId});
        if (!cart){
            return res.status(404).json({message: 'Cart not found'});
        }

        if (cart.items.length === 0){
            return res.status(400).json({message: 'Cart is already empty'});
        }

        cart.items = [];
        await cart.save();

        res.status(200).json({
            message: 'Cart emptied successfully',
            cart,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Internal server error'});
    }
}

exports.applyDiscount = async (req, res) => {
    try {
        const userCart = await Cart.findOne({user: req.userId});
        if (!userCart) {
            return res.status(404).json({message: 'User cart not found'});
        }

        const coupon = await Coupon.findOne({code: req.body.couponCode});
        if (!coupon){
            return res.status(404).json({message: 'Coupon not found'});
        }

        if (coupon.code === req.body.couponCode){
            return res.status(400).json({message: 'Cart already contains that coupon'});
        }
        
        // Ensure if coupon has not reached its uses limit
        if (coupon.usedTimes >= coupon.maxUses){
            return res.status(400).json({message: 'Coupon has reached its max uses'});
        }

        // Check coupon has not expired
        if (new Date() > coupon.expiresAt){
            return res.status(400).json({message: 'Coupon has already expired'});
        }

        userCart.coupon = coupon;

        await userCart.save();

        await userCart.populate('coupon');
        
        res.status(200).json({
            message: 'Coupon added successfully',
            coupon: userCart.coupon,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Internal server error'});
    }
}

exports.removeCurrentCoupon = async (req, res) => {
    try {
        const userCart = await Cart.findOne({user: req.userId});
        if (!userCart) {
            return res.status(404).json({message: 'User cart not found'});
        }

        if (!userCart.coupon){
            return res.status(400).json({message: 'User does not have a coupon in their cart'});
        }

        userCart.coupon = null;
        
        await userCart.save();
        
        return res.status(200).json({message: 'Coupon removed successfully'});
    } catch (err){
        console.err();
        return res.status(500).json({message: 'Internal server error'});
    }
}