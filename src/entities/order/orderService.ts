import { BadRequestError, NotFoundError } from '../../utils/errors';
import orderRepository from './orderRepository';
import cartRepository from '../cart/cartRepository';
import productRepository from '../product/productRepository';
import couponRepository from '../coupon/couponRepository';
import { Order, OrderStatus } from './orderTypes';
import { Product } from '../product/productTypes';
import { Cart } from '../cart/cartTypes';

class OrderService{
    // TODO: Use repositories to update info
    async createOrder(userId: string): Promise<Order>{
        const userCart: Cart | null = await cartRepository.getUserCart(userId);
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
            const product: Product | null = await productRepository.findProductById(item.product.id);

            if (!product){
                errors.push(`Product does not exist`);
                continue;
            }

            if (product.stock < item.quantity){
                errors.push(`Product does not have ${item.quantity} ${product.name}s left`);
                continue;
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
            coupon = await couponRepository.findCouponById(userCart.coupon.id);
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
        }

        // Reduce stock from the products
        for (const { product, quantity } of items){
            product.stock -= quantity;
        }

        const newOrder: Order = await orderRepository.createOrder({
            user: userId,
            items: userCart.items,
            total,
            status: 'paid',
            createdAt: new Date(),
        });

        await cartRepository.clearCart(userCart);

        return newOrder;
    }

    async getOrderHistory(userId: string): Promise<Order[]>{
        const userOrders: Order[] = await orderRepository.getUserOrders(userId);

        return userOrders;
    }

    async getOrderDetails(userId: string, orderId: string): Promise<Order>{
        const order = await orderRepository.findOrder(userId, orderId);

        if (!order){
            throw new NotFoundError('Order not found');
        }

        return order;
    }

    async getAll(): Promise<Order[]>{
        const allOrders: Order[] = await orderRepository.getAllOrders();

        return allOrders;
    }

    async updateStatus(orderId: string, status: 'paid' | 'sent' | 'cancelled' | 'pending'): Promise<OrderStatus>{
        const order: OrderStatus = await orderRepository.updateStatus(orderId, status);
        
        if (!order) {
            throw new NotFoundError('Order not found');
        }
        
        return order;
    }
}

export default new OrderService();