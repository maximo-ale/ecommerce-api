import cartService from './cartService.js';

class CartController{
    async getCart(req, res){
        const cart = await cartService.getCart(req.userId);

        res.status(200).json({
            message: 'Cart found successfully',
            cart,
        });
    }

    async addProductToCart(req, res){
        const { cart, cartCreated } = await cartService.addProductToCart(req.body, req.userId);

        if (cartCreated){
            return res.status(201).json({
                message: 'Cart created successfully',
                cart,
            });
        }

        res.status(200).json({
            message: 'Product added successfully',
            cart,
        });
    }

    async modifyQuantity(req, res){
        const cart = await cartService.modifyQuantity(req.body.quantity, req.params.productId, req.userId);

        res.status(200).json({
            message: 'Product updated successfully',
            cart,
        });
    }

    async removeFromCart(req, res){
        const cart = await cartService.removeFromCart(req.params.productId, req.userId);

        res.status(200).json({
            message: 'Product deleted successfully',
            cart,
        });
    }

    async clearCart(req, res){
        const cart = await cartService.clearCart(req.userId);

        res.status(200).json({
            message: 'Cart emptied successfully',
            cart,
        });
    }

    async applyDiscount(req, res){
        const userCart = await cartService.applyDiscount(req.userId, req.body.code);
        
        res.status(200).json({
            message: 'Coupon added successfully',
            coupon: userCart.coupon,
        });
    }

    async removeCurrentCoupon(req, res){
        await cartService.removeCurrentCoupon(req.userId);
        
        return res.status(200).json({message: 'Coupon removed successfully'});
    }
}

export default new CartController();