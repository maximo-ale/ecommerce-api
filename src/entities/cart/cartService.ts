import { BadRequestError, NotFoundError } from '../../utils/errors';
import cartRepository from './cartRepository';
import productRepository from '../product/productRepository';
import couponRepository from '../coupon/couponRepository';
import { AddProduct, Cart, Item, UpdateProductQuantity } from './cartTypes';
import { Coupon } from '../coupon/couponTypes';
import { Product } from '../product/productTypes';

class CartService{
    async getCart(userId: string){

        const cart: Cart | null = await cartRepository.getUserCart(userId);

        if (!cart){
            throw new NotFoundError('Cart not found');
        }

        return cart;
    }

    async addProductToCart(data: AddProduct, userId: string): Promise<{cart: Cart, cartCreated: boolean}>{
        const { productId, quantity } = data;

        const product: Product | null = await productRepository.findProductById(productId);

        if (!product){
            throw new NotFoundError('Product not found');
        }

        // Look if user requested more products than available
        if (quantity > product.stock){
            throw new BadRequestError(`Product does not have ${quantity} ${product.name}s left`);
        }

        let cart: Cart | null = await cartRepository.getUserCart(userId)

        // Create a cart if user does not have one
        if (!cart) {
            cart = await cartRepository.createNewCart({
                userId,
                item: {
                    product: {
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        category: product.category,
                        price: product.price,
                        stock: product.stock,
                        image: product.image
                    },
                    quantity,
                },
            });
            
            return { cart, cartCreated: true };
        } else {
            // Add quantity if item already exists
            const existingItem: Item | undefined = cart.items.find(item => item.product.id === productId);
            if (existingItem) {
                if (existingItem.quantity + quantity > product.stock){
                    throw new BadRequestError(`Product does not have ${quantity + existingItem.quantity} ${product.name}s left`);
                }

                const updatedQuantity = existingItem.quantity += quantity;
                await cartRepository.updateQuantity(productId, updatedQuantity, cart);
            } else {
                await cartRepository.addProductToCart(productId, quantity, cart);
            }
        }

        return { cart, cartCreated: false };
    }

    async updateQuantity(data: UpdateProductQuantity){
        const { quantity, userId, productId} = data;

        const product: Product | null = await productRepository.findProductById(productId);

        if (!product){
            throw new NotFoundError('Product not found');
        }

        if (quantity > product.stock){
            throw new BadRequestError(`Product does not have ${quantity} ${product.name}/s left`);
        }

        const cart = await cartRepository.getUserCart(userId);
        if (!cart) {
            throw new NotFoundError('Cart not found');
        }

        const isProductInCart: boolean = await cartRepository.isProductInCart(productId, cart);

        if (!isProductInCart){
            throw new NotFoundError('Product is not in the cart');
        }
        await cartRepository.updateQuantity(productId, quantity, cart);


        return cart;
    }

    async removeFromCart(productId: string, userId: string): Promise<Cart>{
        const cart: Cart | null = await cartRepository.getUserCart(userId);
        if (!cart) {
            throw new NotFoundError('Cart not found');
        }
        
        const isProductInCart: boolean = await cartRepository.isProductInCart(productId, cart);
        if (!isProductInCart){
            throw new BadRequestError('Product is not in the cart');
        }
        
        await cartRepository.removeProductFromCart(productId, cart);

        return cart;
    }

    async clearCart(userId: string): Promise<void>{
        const cart: Cart | null = await cartRepository.getUserCart(userId);
        if (!cart){
            throw new NotFoundError('Cart not found');
        }

        if (cart.items.length === 0){
            throw new BadRequestError('Cart is already empty');
        }

        await cartRepository.clearCart(cart);
    }

    async applyDiscount(userId: string, couponCode: string): Promise<Coupon>{
        const cart: Cart | null = await cartRepository.getUserCart(userId);
        if (!cart){
            throw new NotFoundError('Cart not found');
        }

        const coupon: Coupon | null = await couponRepository.findCouponByCode(couponCode);
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

        const addedCoupon: Coupon = await cartRepository.addCoupon(cart, coupon.id);

        return addedCoupon;
    }

    async removeCurrentCoupon(userId: string){
        const cart: Cart | null = await cartRepository.getUserCart(userId);
        if (!cart) {
            throw new NotFoundError('Cart not found');
        }

        if (!cart.coupon){
            throw new BadRequestError('User does not have a coupon in their cart');
        }

        await cartRepository.removeCoupon(userId);
    }
}

export default new CartService();