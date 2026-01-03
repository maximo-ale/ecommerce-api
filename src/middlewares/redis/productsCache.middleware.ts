import type { Request, Response, NextFunction } from 'express';
import { redis } from '../../utils/redis';

export const getAllProducts = async(req: Request, res: Response, next: NextFunction) => {
    const cachedProducts: string | null = await redis.get('products:all');

    console.log('Cache products: ', cachedProducts);
    if (cachedProducts) {
        return res.status(200).json({
            message: 'Products found successfully',
            products: JSON.parse(cachedProducts),
        });
    }

    next();
}

export const getCachedProduct = async(req: Request, res: Response, next: NextFunction) => {
    const cachedProduct: string | null = await redis.get(`product:${req.params.productId}`);

    if (cachedProduct){
        return res.status(200).json({
            message: 'Product found successfully',
            products: JSON.parse(cachedProduct),
        })
    }

    next();
}
