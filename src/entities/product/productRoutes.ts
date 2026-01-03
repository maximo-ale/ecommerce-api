import express from 'express';
const router = express.Router();

import { auth, adminOnly } from '../../middlewares/authMiddleware';
import productController from './productController';

import validate from '../../middlewares/validateRequest';
import { createProductSchema, findProductSchema, updateProductSchema } from './productSchema';
import { productIdSchema } from '../../utils/zod/idSchema';

// Cache from Redis
import { getAllProducts, getCachedProduct } from '../../middlewares/redis/productsCache.middleware';

router.post('/create',
    validate(createProductSchema, 'body'),
    auth, adminOnly,
    productController.create);

router.get('/find',
    validate(findProductSchema, 'query'),
    getAllProducts,
    productController.find);

router.get('/find/:productId', 
    validate(productIdSchema, 'params'),
    getCachedProduct,
    productController.findOne);

router.patch('/update/:productId',
    validate(productIdSchema, 'params'), validate(updateProductSchema, 'body'),
    auth, adminOnly,
    productController.update);

router.patch('/delete/:productId',
    validate(productIdSchema, 'params'),
    auth, adminOnly,
    productController.delete);

export default router;