import cartService from './cartService';
import type { Request, Response } from 'express';

class CartController{
    async getCart(req: Request, res: Response){
        const cart = await cartService.getCart(req.userId!);

        res.status(200).json({
            message: 'Cart found successfully',
            cart,
        });
    }

    async addProductToCart(req: Request, res: Response){
        const { cart, cartCreated } = await cartService.addProductToCart(req.body, req.userId!);

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

    async updateQuantity(req: Request, res: Response){
        const cart = await cartService.updateQuantity({
            quantity: req.body.quantity,
            productId: req.params.productId,
            userId: req.userId!
        });

        res.status(200).json({
            message: 'Product updated successfully',
            cart,
        });
    }

    async removeFromCart(req: Request, res: Response){
        const cart = await cartService.removeFromCart(req.params.productId, req.userId!);

        res.status(200).json({
            message: 'Product deleted successfully',
            cart,
        });
    }

    async clearCart(req: Request, res: Response){
        const cart = await cartService.clearCart(req.userId!);

        res.status(200).json({
            message: 'Cart emptied successfully',
            cart,
        });
    }

    async applyDiscount(req: Request, res: Response){
        const coupon = await cartService.applyDiscount(req.userId!, req.body.code);
        
        res.status(200).json({
            message: 'Coupon added successfully',
            coupon,
        });
    }

    async removeCurrentCoupon(req: Request, res: Response){
        await cartService.removeCurrentCoupon(req.userId!);
        
        return res.status(200).json({message: 'Coupon removed successfully'});
    }
}

export default new CartController();