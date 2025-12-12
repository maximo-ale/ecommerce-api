import productService from './productService';
import type { Request, Response } from 'express';

class ProductController{
    async create(req: Request, res: Response){
        const newProduct = await productService.create(req.body);

        res.status(201).json({
            message: 'New product created successfully',
            product: newProduct,
        });
    }

    async find(req: Request, res: Response){
        const product = await productService.find(req.query);

        res.status(200).json({
            message: 'Products found successfully',
            product,
        });
    }

    async findOne(req: Request, res: Response){
        const product = await productService.findOne(req.params.productId);

        res.status(200).json({
            message: 'Product found successfully',
            product,
        });
    }

    async update(req: Request, res: Response){
        const newProduct = await productService.update(req.body, req.params.productId);

        res.status(200).json({
            message: 'Product updated successfully',
            newProduct,
        });
    }

    async delete(req: Request, res: Response){
        const product = await productService.delete(req.params.productId);

        res.status(200).json({
            message: 'Product deleted successfully',
            product,
        });
    }
}

export default new ProductController();