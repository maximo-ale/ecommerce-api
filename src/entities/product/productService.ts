import { redis } from '../../utils/redis';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import productRepository from './productRepository';
import { Product, ProductFilters, UpdateProduct } from './productTypes';

class ProductService{
    async create(data: Product): Promise<Product>{
        const {name, description, price, category, stock, image} = data;

        const newProduct: Product = await productRepository.create({
            name,
            description,
            price,
            category,
            stock,
            image,
        });

        await redis.set('product:id', JSON.stringify(newProduct), { EX: 45});

        // Delete Redis's cache
        await redis.del('products:all');

        return newProduct;
    }

    // Find products by using filters
    async find(filters: ProductFilters): Promise<Product[]>{
        const {name, category, minPrice, maxPrice, stock, page, limit} = filters;
        const filter: ProductFilters = {};

        // Prepare filters
        if (name) filter.name = name;
        if (page) filter.page = page;
        if (limit) filter.limit = limit;

        // Filter min and max price
        if (minPrice) filter.minPrice = minPrice;
        if (maxPrice) filter.maxPrice = maxPrice;
        if (category) filter.category = category;
        if (stock) filter.stock = stock;

        // Look products using the filter (only not deleted ones)
        const products: Product[] = await productRepository.filterProducts(filter);

        if (products.length === 0){
            throw new NotFoundError('No products found');
        }

        // Save products in cache
        await redis.set('products:all', JSON.stringify(products), {EX: 60});

        return products;
    }

    async findOne(productId: string): Promise<Product>{
        const product: Product | null = await productRepository.findProductById(productId);

        if (!product){
            throw new NotFoundError('Product not found');
        }

        // Save product in cache
        await redis.set(`product:${product.id}`, JSON.stringify(product), {EX: 45});

        return product;
    }

    async update(data: UpdateProduct, productId: string): Promise<Product>{
        // Look if user sent extra fields to update
        const validFields = ['name', 'description', 'price', 'category', 'stock', 'image'];
        const receivedFields = Object.keys(data);

        const isValid = receivedFields.every(field => validFields.includes(field));
        if (!isValid){
            throw new BadRequestError('Invalid field values');
        }

        const productToUpdate = await productRepository.findProductById(productId)
        if (!productToUpdate){
            throw new NotFoundError('Product not found');
        }

        const newProduct: Product = await productRepository.updateProduct(productId, data);

        // Delete cache
        await redis.del('products:all');
        await redis.del(`product:${newProduct.id}`);

        return newProduct;
    }

    async delete(productId: string): Promise<Product>{
        const product: Product | null = await productRepository.deleteProduct(productId);

        if (!product) {
            throw new NotFoundError('Product not found');

        }

        // Delete cache
        await redis.del('products:all');
        await redis.del(`product:${product.id}`);

        return product;
    }
}

export default new ProductService();