import orderService from './orderService.js';

class OrderController{
    async createOrder(req, res){
        const newOrder = await orderService.createOrder(req.userId);

        res.status(201).json({
            message: 'Order created successfully',
            order: newOrder,
        });
    }

    async getOrderHistory(req, res){
        const userOrders = await orderService.getOrderHistory(req.userId);

        res.status(200).json({
            message: 'User orders found successfully',
            userOrders,
        });
    }

    async getOrderDetails(req, res){
        const order = await orderService.getOrderDetails(req.userId, req.params.orderId);

        res.status(200).json({
            message: 'Order found successfully',
            order,
        });
    }

    async getAll(req, res){
        const allOrders = await orderService.getAll();

        res.status(200).json({
            message: 'All orders found successfully',
            allOrders,
        });
    }

    async modifyState(req, res){
        const order = await orderService.modifyState(req.params.orderId, req.body.status);

        res.status(200).json({
            message: 'Order updated successfully',
            order,
        });        
    }
}

export default new OrderController();