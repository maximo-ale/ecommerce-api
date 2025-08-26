import { BadRequestError, NotFoundError } from '../../utils/errors.js';
import cartRepository from './cartRepository.js';
import productRepository from '../product/productRepository.js';
import couponRepository from '../coupon/couponRepository.js';

class CartService{
    async getCart(userId){

        const cart = await cartRepository.getUserCart(userId, false);

        if (!cart){
            throw new NotFoundError('Cart not found');
        }

        return cart;
    }

    async addProductToCart(data, userId){
        const { productId, quantity } = data;

        const product = await productRepository.findProduct({productId, isDeleted: false});

        if (!product){
            throw new NotFoundError('Product not found');
        }

        // Look if user requested more products than available
        if (quantity > product.stock){
            throw new BadRequestError(`Product does not have ${quantity} ${product.name}s left`);
        }

        let cart = await cartRepository.getUserCart(userId, false)

        // Create a cart if user does not have one
        if (!cart) {
            cart = await cartRepository.createNewCart({
                user: userId,
                items: [{
                    product: productId,
                    quantity,
                }],
            });
            
            return { cart, cartCreated: true };
        } else {
            // Add quantity if item already exists
            const existingItem = cart.items.find(item => item.product.equals(productId));
            if (existingItem) {
                if (existingItem.quantity + quantity > product.stock){
                throw new BadRequestError(`Product does not have ${quantity + existingItem.quantity} ${product.name}s left`);
                }

                existingItem.quantity += quantity;
            } else {
                cart.items.push({product: productId, quantity,});
            }
        }

        await cartRepository.saveCart(cart);

        return { cart, cartCreated: false };
    }

    async modifyQuantity(quantity, productId, userId){
        const product = await productRepository.findProductById(productId);

        if (!product){
            throw new NotFoundError('Product not found');
        }

        if (quantity > product.stock){
            throw new BadRequestError(`Product does not have ${quantity} ${product.name}/s left`);
        }

        const cart = await cartRepository.getUserCart(userId, false);
        if (!cart) {
            throw new NotFoundError('Cart not found');
        }

        const idx = cart.items.findIndex(i => i.product.equals(productId));

        if (idx === -1){
            throw new NotFoundError('Item not found');
        }

        cart.items[idx].quantity = quantity;

        await cartRepository.saveCart(cart);

        return cart;
    }

    async removeFromCart(productId, userId){
        const cart = await cartRepository.getUserCart(userId, false);
        if (!cart) {
            throw new NotFoundError('Cart not found');
        }
        
        if (!cart.items.some(item => item.product.equals(productId))){
            throw new BadRequestError('Product is not in the cart');
        }
        
        cart.items = cart.items.filter(i => !i.product.equals(productId));

        await cartRepository.saveCart(cart);

        return cart;
    }

    async clearCart(userId){
        const cart = await cartRepository.getUserCart(userId, false);
        if (!cart){
            throw new NotFoundError('Cart not found');
        }

        if (cart.items.length === 0){
            throw new BadRequestError('Cart is already empty');
        }

        cart.items = [];

        await cartRepository.saveCart(cart);
    }

    async applyDiscount(userId, couponCode){
        const cart = await cartRepository.getUserCart(userId, false);
        if (!cart){
            throw new NotFoundError('Cart not found');
        }

        const coupon = await couponRepository.findCouponByCode({code: couponCode});
        if (!coupon){
            throw new NotFoundError('Coupon not found');
        }
        
        // Ensure if coupon has not reached its uses limit
        if (coupon.usedTimes >= coupon.maxUses){
            throw new BadRequestError('Coupon has reached its max uses');
        }

        // Check coupon has not expired
        if (new Date() > coupon.expiresAt){
            throw new BadRequestError('Coupon has already expired');
        }

        cart.coupon = coupon;

        await cartRepository.saveCart(cart);

        return cart.coupon;
    }

    async removeCurrentCoupon(userId){
        const cart = await cartRepository.getUserCart(userId, false);
        if (!cart) {
            throw new NotFoundError('Cart not found');
        }

        if (!cart.coupon){
            throw new BadRequestError('User does not have a coupon in their cart');
        }

        cart.coupon = null;
        
        await cartRepository.saveCart(cart);
    }
}

export default new CartService();