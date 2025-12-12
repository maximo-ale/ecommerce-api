import { CreateProduct, Product, ProductFilters, UpdateProduct } from './productTypes.js';
import pool from '../../config/connectDB';

class ProductRepository{
    async create(data: CreateProduct): Promise<Product>{
        const { name, description, category, price, stock, image } = data;

        const product = await pool.query(`
            INSERT INTO products (name, description, category, price, stock, image)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
            `, [name, description, category, price, stock, image]
        );

        const row: Product = product.rows[0];

        return {
            id: row.id.toString(),
            name: row.name,
            description: row.description,
            category: row.category,
            price: row.price,
            stock: row.stock,
            image: row.image,
        }
    }

    async filterProducts(filter: ProductFilters): Promise<Product[]>{
        const { category, stock, minPrice, maxPrice, name, page = 1, limit = 10} = filter;
        let fields: string[] = [];
        let values = []
        let idx = 1;

        if (category){
            fields.push(`category = $${idx}`);
            values.push(category);
            idx++;
        }

        if (stock){
            fields.push(`stock >= $${idx}`);
            values.push(stock);
            idx++;
        }

        if (minPrice){
            fields.push(`price >= $${idx}`);
            values.push(minPrice);
            idx++;
        }

        if (maxPrice){
            fields.push(`price <= $${idx}`);
            values.push(maxPrice);
            idx++;
        }

        if (name){
            fields.push(`name LIKE %$${idx}%`);
            values.push(name);
            idx++;
        }

        // Select all non-deleted products by default
        let query = 'SELECT * FROM products WHERE is_deleted = false';

        if (fields.length > 0){
            query += ` AND ${fields.join(' AND ')}`;
        }

        // Add pagination (default: page = 1, limit = 10)
        query += ` LIMIT ${limit}`;
        query += ` OFFSET ${(page - 1) * limit}`; 

        const products = await pool.query(query, values);

        return products.rows;
    }

    async findProductById(productId: string): Promise<Product | null>{
        const result = await pool.query(`
            SELECT *
            FROM products
            WHERE id = $1;
        `, [productId] );

        const product: Product = result.rows[0];
        if (!product) return null;
        
        return {
            id: product.id.toString(),
            name: product.name,
            description: product.description,
            category: product.category,
            price: product.price,
            stock: product.stock,
            image: product.image,
        }
    }

    async updateProduct(productId: string, data: UpdateProduct): Promise<Product>{
        const { name, description, category, price, stock, image } = data;
        let fields: string[] = [];
        let values = [];
        let idx = 2;

        // fields.length = 0 will never happen because it's checked in the service

        if (name){
            fields.push(`name = $${idx}`);
            values.push(name);
            idx++;
        }

        if (description){
            fields.push(`description = $${idx}`);
            values.push(description);
            idx++;
        }
        if (category){
            fields.push(`category = $${idx}`);
            values.push(category);
            idx++;
        }
        if (price){
            fields.push(`price = $${idx}`);
            values.push(price);
            idx++;
        }
        if (stock){
            fields.push(`stock = $${idx}`);
            values.push(stock);
            idx++;
        }
        if (image){
            fields.push(`image = $${idx}`);
            values.push(image);
            idx++;
        }

        const result = await pool.query(`
            UPDATE products
            SET ${fields.join(', ')}
            WHERE id = $1
            RETURNING *
            `, [productId, ...values]
        );

        const product: Product = result.rows[0];

        return {
            id: product.id,
            name: product.name,
            description: product.description,
            category: product.category,
            price: product.price,
            stock: product.stock,
            image: product.image,
        }
    }

    async deleteProduct(productId: string): Promise<Product | null>{
        const result = await pool.query(`
            UPDATE products
            SET is_deleted = true
            WHERE id = $1
            RETURNING *;
            `, [productId]
        );

        const product: Product = result.rows[0];

        if (!product){
            return null;
        }

        return {
            id: product.id,
            name: product.name,
            description: product.description,
            category: product.category,
            price: product.price,
            stock: product.stock,
            image: product.image,            
        }
    }
}

export default new ProductRepository();