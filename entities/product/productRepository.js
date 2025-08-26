import Product from './Product.js';

class ProductRepository{
    async create(data){
        const product = new Product(data);
        return await product.save();
    }

    async filterProducts(filter, isDeleted = false, limit, page){
        if (limit && page){
            return await Product.find({...filter, isDeleted}).limit(limit).skip((page - 1) * limit);
        }
        if (true){
            return await Product.find({...filter, isDeleted});
        }
        return await Product.find({isDeleted});
    }
    async findProductById(id){
        return await Product.findOne({_id: id, isDeleted: false});
    }

    async findProduct({productId, isDeleted}){
        return await Product.findOne({_id: productId, isDeleted}); 
    }

    async updateProduct(productId, data){
        return await Product.findByIdAndUpdate(
            productId,
            {$set: data},
            {new: true, runValidators: true},
        );
    }

    async saveProduct(product){
        await product.save();
    }
}

export default new ProductRepository();