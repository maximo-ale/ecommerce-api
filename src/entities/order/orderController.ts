import orderService from './orderService';
import type { Request, Response } from 'express';

class OrderController{
    async createOrder(req: Request, res: Response){
        const newOrder = await orderService.createOrder(req.userId!);

        res.status(201).json({
            message: 'Order created successfully',
            order: newOrder,
        });
    }

    async getOrderHistory(req: Request, res: Response){
        const userOrders = await orderService.getOrderHistory(req.userId!);

        res.status(200).json({
            message: 'User orders found successfully',
            userOrders,
        });
    }

    async getOrderDetails(req: Request, res: Response){
        const order = await orderService.getOrderDetails(req.userId!, req.params.orderId);

        res.status(200).json({
            message: 'Order found successfully',
            order,
        });
    }

    async getAll(req: Request, res: Response){
        const allOrders = await orderService.getAll();

        res.status(200).json({
            message: 'All orders found successfully',
            allOrders,
        });
    }

    async updateStatus(req: Request, res: Response){
        const order = await orderService.updateStatus(req.params.orderId, req.body.status);

        res.status(200).json({
            message: 'Order updated successfully',
            order,
        });        
    }
}

export default new OrderController();