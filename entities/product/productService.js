import { BadRequestError, NotFoundError } from '../../utils/errors.js';
import productRepository from './productRepository.js';

class ProductService{
    async create(data){
        const {name, description, price, category, stock, image} = data;

        const newProduct = await productRepository.create({
            name,
            description,
            price,
            category,
            stock,
            image,
            isDeleted: false,
        });

        return newProduct;
    }

    async find(filters){
        const {name, category, minPrice, maxPrice, stock, page, limit} = filters;
        const filter = {};

        // Prepare filters
        if (name) filter.name = {$regex: name, $options: 'i'};

        // Filter min and max price
        if (minPrice !== undefined && maxPrice !== undefined){
            if(minPrice > maxPrice){
                throw new BadRequestError('Minimum price cannot be greater than maximum price');
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
        const products = await productRepository.filterProducts(filter, false, limit, page);

        if (products.length === 0){
            throw new NotFoundError('No products found');
        }

        return products;
    }

    async findOne(productId){
        const product = await productRepository.findProductById(productId);

        if (!product){
            throw new NotFoundError('Product not found');
        }

        return product;
    }

    async modify(data, productId){
        const validFields = ['name', 'description', 'price', 'category', 'stock', 'image'];
        const receivedFields = Object.keys(data);

        const isValid = receivedFields.every(field => validFields.includes(field));
        if (!isValid){
            throw new BadRequestError('Invalid field values');
        }

        const productToModify = await productRepository.findProductById(productId)
        if (!productToModify){
            throw new NotFoundError('Product not found');
        }

        const newProduct = await productRepository.updateProduct(productId, data);

        return newProduct;
    }

    async delete(productId){
        const product = await productRepository.updateProduct(productId, {isDeleted: true});

        if (!product) {
            throw new NotFoundError('Product not found');

        }

        return product;
    }
}

export default new ProductService();