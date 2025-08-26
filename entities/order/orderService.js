import { BadRequestError, NotFoundError } from '../../utils/errors.js';
import orderRepository from './orderRepository.js';
import cartRepository from '../cart/cartRepository.js';
import productRepository from '../product/productRepository.js';
import couponRepository from '../coupon/couponRepository.js';

class OrderService{
    async createOrder(userId){
        const userCart = await cartRepository.getUserCart(userId, true);
        if (!userCart){
            throw new NotFoundError('User cart not found');
        }

        if (userCart.items.length === 0){
            throw new BadRequestError('Cart contains no products');
        }
        
        const errors = [];

        let items = [];

        // Verify all products are available to buy
        for(const item of userCart.items){
            const product = await productRepository.findProductById(item.product._id);

            if (!product){
                errors.push(`Product ${item.product._id} does not exist`);
            }

            if (product.stock < item.quantity){
                errors.push(`Product does not have ${item.quantity} ${product.name}s left`);
            }

            items.push(item);
        };

        if (errors.length > 0) {
            throw new BadRequestError(errors.join(', '));
        }

        // Calculate total price
        let total = userCart.items.reduce((total, current) => total + current.product.price * current.quantity, 0);

        let coupon;
        if (userCart.coupon){
            coupon = await couponRepository.findCouponByCode({code: userCart.coupon.code});
        }

        // Apply coupon discount if cart contains one
        if (coupon){
            if (coupon.usedTimes >= coupon.maxUses){
                throw new BadRequestError('Coupon has reached its max uses');
            }

            if (new Date() > coupon.expiresAt){
                throw new BadRequestError('Coupon has already expired');
            }

            const discount = coupon.discountPercent * total / 100;
            const maxDiscountAmount = coupon.maxDiscountAmount ?? Infinity;

            total -= Math.min(discount, maxDiscountAmount);

            coupon.usedTimes++;
            coupon.usedBy.push(userId);

            await couponRepository.saveCoupon(coupon);
        }

        // Reduce stock from the products
        for (const { product, quantity } of items){
            product.stock -= quantity;
            await productRepository.saveProduct(product);
        }

        const newOrder = await orderRepository.createOrder({
            user: userId,
            products: userCart.items,
            total,
            status: 'payed',
            date: Date.now(),
        });
        
        userCart.items = [];
        await cartRepository.saveCart(userCart);

        return newOrder;
    }

    async getOrderHistory(userId){
        const userOrders = orderRepository.getUserOrders(userId);

        return userOrders;
    }

    async getOrderDetails(userId, orderId){
        const order = await orderRepository.findUserOrder(userId, orderId);

        if (!order){
            throw new NotFoundError('Order not found');
        }

        return order;
    }

    async getAll(){
        const allOrders = await orderRepository.getAllOrders();

        return allOrders;
    }

    async modifyState(orderId, status){
        const order = await orderRepository.modifyState(orderId, status);
        
        if (!order) {
            throw new NotFoundError('Order not found');
        }
        
        return order;
    }
}

export default new OrderService();