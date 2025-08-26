import Order from "./Order.js";

class OrderRepository{
    async createOrder(data){
        const newOrder = new Order(data);
        return await newOrder.save();
    }

    async modifyState(orderId, status){
        return await Order.findByIdAndUpdate(
            orderId,
            {status},
            {new: true, runValidators: true},
        );
    }
    async getUserOrders(userId){
        return await Order.find({user: userId});
    }

    async findUserOrder(userId, orderId){
        return await Order.findOne({user: userId, _id: orderId})
    }

    async getPaidObjects(userId, productId){
        return await Order.findOne({user: userId, status: 'payed', 'products.product': productId});
    }
    async getAllOrders(){
        return await Order.find();
    }
}

export default new OrderRepository();