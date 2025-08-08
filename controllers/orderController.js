const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
    try {
        const userCart = await Cart.findOne({user: req.userId}).populate([{path: 'items.product'}, {path: 'coupon'}]);
        if (!userCart){
            return res.status(404).json({message: 'User cart not found'});
        }

        if (userCart.items.length === 0){
            return res.status(400).json({message: 'Cart contains no products'});
        }
        
        const errors = [];

        let items = [];

        // Verify all products are available to buy
        for(const item of userCart.items){
            const product = await Product.findById(item.product._id);

            if (!product){
                errors.push(`Product ${item.product._id} does not exist`);
            }

            if (product.stock < item.quantity){
                errors.push(`Product does not have ${item.quantity} ${product.name}s left`);
            }

            items.push(item);
        };

        if (errors.length > 0) {
            return res.status(400).json({message: errors});
        }

        // Calculate total price
        let total = userCart.items.reduce((total, current) => total + current.product.price * current.quantity, 0);

        let coupon;
        if (userCart.coupon){
            coupon = await Coupon.findOne({code: userCart.coupon.code});
        }

        // Apply coupon discount if cart contains one
        if (coupon){
            if (coupon.usedTimes >= coupon.maxUses){
                return res.status(400).json({message: 'Coupon has reached its max uses'})
            }

            if (new Date() > coupon.expiresAt){
                return res.status(400).json({message: 'Coupon has already expired'});
            }

            const discount = coupon.discountPercent * total / 100;
            const maxDiscountAmount = coupon.maxDiscountAmount ?? Infinity;

            total -= Math.min(discount, maxDiscountAmount);

            coupon.usedTimes++;
            coupon.usedBy.push(req.userId);

            await coupon.save();
        }

        // Reduce stock from the products
        for (const { product, quantity } of items){
            product.stock -= quantity;
            await product.save();
        }

        const newOrder = new Order({
            user: req.userId,
            products: userCart.items,
            total,
            status: 'payed',
            date: Date.now(),
        });

        await newOrder.save();
        
        userCart.items = [];
        await userCart.save();

        res.status(201).json({
            message: 'Order created successfully',
            order: newOrder,
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Internal server error'});
    }
}

exports.getOrderHistory = async (req, res) => {
    try {
        const userOrders = await Order.find({user: req.userId});

        if (userOrders.length === 0){
            return res.status(400).json({message: 'User has not made any order yet'});
        }

        res.status(200).json({
            message: 'User orders found successfully',
            userOrders,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Internal server error'});
    }
}

exports.getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findOne({_id: req.params.orderId, user: req.userId});

        if (!order){
            return res.status(404).json({message: 'Order not found'});
        }

        res.status(200).json({
            message: 'Order found successfully',
            order,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Internal server error'});
    }
}

exports.getAll = async (req, res) => {
    try {
        const allOrders = await Order.find();

        if (allOrders.length === 0){
            return res.status(404).json({message: 'Orders not found'});
        }

        res.status(200).json({
            message: 'All orders found successfully',
            allOrders,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Internal server error'});
    }
}

exports.modifyState = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.orderId,
            {status: req.body.status},
            {new: true, runValidators: true},
        );
        
        if (!order) {
            return res.status(404).json({message: 'Order not found'});
        }

        res.status(200).json({
            message: 'Order updated successfully',
            order,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Internal server error'});
    }
}