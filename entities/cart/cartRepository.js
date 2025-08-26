import Cart from "./Cart.js";

class CartRepository{
    async getUserCart(userId, populate = true){
        if (populate){
            return await Cart.findOne({user: userId}).populate([
                {path: 'coupon'},
                {path: 'items.product'},
            ]);
        }

        return await Cart.findOne({user: userId});
    }

    async createNewCart(data){
        const newCart = new Cart(data);
        return await newCart.save();
    }

    async saveCart(cart){
        return await cart.save();
    }
    
    async cleanCart(userId){
        const cart = await Cart.findOne({user: userId});

        if (!cart) return;

        cart.items = [];
        await cart.save();
    }
}

export default new CartRepository();