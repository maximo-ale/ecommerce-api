import productService from './productService.js';

class ProductController{
    async create(req, res){
        const newProduct = await productService.create(req.body);

        res.status(201).json({
            message: 'New product created successfully',
            product: newProduct,
        });
    }

    async find(req, res){
        const product = await productService.find(req.query);

        res.status(200).json({
            message: 'Products found successfully',
            product,
        });
    }

    async findOne(req, res){
        const product = await productService.findOne(req.params.id);

        res.status(200).json({
            message: 'Product found successfully',
            product,
        });
    }

    async modify(req, res){
        // Look if user sent extra fields to modify
        const newProduct = await productService.modify(req.body, req.params.id);

        res.status(200).json({
            message: 'Product updated successfully',
            newProduct,
        });
    }

    async delete(req, res){
        const product = await productService.delete(req.params.id);

        res.status(200).json({
            message: 'Product deleted successfully',
            product,
        });
    }
}

export default new ProductController();