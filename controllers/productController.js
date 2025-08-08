const Product = require('../models/Product');
const User = require('../models/User');

// Create product (only admins)
exports.create = async (req, res) => {
    try {
        const {name, description, price, category, stock, image} = req.body;

        const newProduct = new Product({
            name,
            description,
            price,
            category,
            stock,
            image,
            isDeleted: false,
        });

        await newProduct.save();

        res.status(201).json({
            message: 'New product created successfully',
            product: newProduct,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Internal server error'});
    }
}

// Find product using query parameters
exports.find = async (req, res) => {
    try {
        const {name, category, minPrice, maxPrice, stock, page, limit} = req.query;
        const filter = {};

        // Prepare filters
        if (name) filter.name = {$regex: name, $options: 'i'};

        // Filter min and max price
        if (minPrice !== undefined && maxPrice !== undefined){
            if(minPrice > maxPrice){
                return res.status(400).json({message: 'Minimum price cannot be greater than maximum price'});
            }
            filter.price = {$gte: minPrice, $lte: maxPrice};
        } else if (minPrice !== undefined){
            filter.price = {$gte: minPrice};
        } else if (maxPrice !== undefined){
            filter.price = {$lte: maxPrice};
        }

        if (category) filter.category = category;
        if (stock) filter.stock = {$gte: stock};

        // Look products using the filter (only not deleted ones)
        const product = await Product.find({...filter, isDeleted: false}).limit(limit).skip((page - 1) * limit);

        if (product.length === 0){
            return res.status(404).json({message: 'No products found'});
        }

        res.status(200).json({
            message: 'Products found successfully',
            product,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Internal server error'});
    }
}

exports.findOne = async (req, res) => {
    try {
        const product = await Product.findOne({_id: req.params.id, isDeleted: false});

        if (!product){
            return res.status(404).json({message: 'Product not found'});
        }

        res.status(200).json({
            message: 'Product found successfully',
            product,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Internal server error'});
    }
}

exports.modify = async (req, res) => {
    try {
        // Look if user sent extra fields to modify
        const validFields = ['name', 'description', 'price', 'category', 'stock', 'image'];
        const receivedFields = Object.keys(req.body);

        const isValid = receivedFields.every(field => validFields.includes(field));
        if (!isValid){
            return res.status(400).json({message: 'Invalid field values'});
        }

        const productToModify = await Product.findById(req.params.id);
        if (!productToModify){
            return res.status(404).json({message: 'Product not found'});
        }

        // Verify if product is already deleted
        if (productToModify.isDeleted){
            return res.status(400).json({message: 'Cannot modify a deleted product'});
        }

        const newProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {$set: req.body},
            {new: true, runValidators: true},
        );

        if (!newProduct){
            return res.status(404).json({message: 'Product not found'});
        }

        res.status(200).json({
            message: 'Product updated successfully',
            newProduct,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Internal server error'});
    }
}

exports.deleteProduct = async (req, res) => {
    try {
        // Soft delete
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {isDeleted: true},
            {new: true, runValidators: true},
        );

        if (!product) {
            return res.status(404).json({message: 'Product not found'});
        }
        
        res.status(200).json({
            message: 'Product deleted successfully',
            product,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Internal server error'});
    }
}