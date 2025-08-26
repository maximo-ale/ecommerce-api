import express from 'express';
const router = express.Router();

import { auth, adminOnly } from '../../middlewares/authMiddleware.js';
import productController from './productController.js';

import {body, param, query} from 'express-validator';
import validateRequest from '../../middlewares/validateRequest.js';

router.post('/create',
    body('name').isString().withMessage('Name must be a string').bail().trim().notEmpty().withMessage('Name is mandatory'),
    body('description').isString().withMessage('Description must be a string').bail().trim().notEmpty().withMessage('Description is mandatory'),
    body('category').isString().withMessage('Category must be a string').bail().notEmpty().withMessage('Category is mandatory'),
    body('image').isString().withMessage('Image must be a string').bail().trim().notEmpty().withMessage('Image is mandatory'),
    body('price').toInt().isInt({min: 0}).withMessage('Invalid price value'),
    body('stock').toInt().isInt({min: 0}).withMessage('Invalid stock value'),
    validateRequest, auth, adminOnly, productController.create);

router.get('/find', 
    query('name').optional().isString().withMessage('Name must be a string').bail().trim().notEmpty().withMessage('Invalid name value'),
    query('category').optional().isString().withMessage('Category must be a string').bail().trim().notEmpty().withMessage('Invalid category value'),
    query('minPrice').optional().toInt().isInt({min: 0}).withMessage('Invalid min price value'),
    query('maxPrice').optional().toInt().isInt({min: 0}).withMessage('Invalid max price value'),
    query('stock').optional().toInt().isInt({min: 0}).withMessage('Invalid stock value'),
    validateRequest, productController.find);

router.get('/find/:id', 
    param('id').isMongoId().withMessage('Invalid ID'),
    validateRequest, productController.findOne);

router.patch('/modify/:id',
    param('id').isMongoId().withMessage('Invalid ID'),
    body('name').optional().isString().withMessage('Name must be a string').bail().trim().notEmpty().withMessage('Invalid name value'),
    body('description').optional().isString().withMessage('Name must be a string').bail().trim().notEmpty().withMessage('Invalid description value'),
    body('category').optional().isString().withMessage('Name must be a string').bail().trim().notEmpty().withMessage('Invalid category value'),
    body('image').optional().isString().withMessage('Name must be a string').bail().trim().notEmpty().withMessage('Invalid image value'),
    body('price').optional().trim().toInt().isInt({min: 0}).withMessage('Invalid price value'),
    body('stock').optional().trim().toInt().isInt({min: 0}).withMessage('Invalid stock value'),
    validateRequest, auth, adminOnly, productController.modify);

router.patch('/delete/:id',
    param('id').isMongoId().withMessage('Invalid ID'),
    validateRequest, auth, adminOnly, productController.delete);

export default router;