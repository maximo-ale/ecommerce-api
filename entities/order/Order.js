import mongoose from 'mongoose';

const {Schema, model} = mongoose;

const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    products: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        quantity: {
            type: Number,
            min: 1,
            required: true,
        },
    }],
    total: Number,
    status: {
        type: String,
        enum: ['pending', 'payed', 'sent', 'cancelled'],
        default: 'pending',
    },
    createdAt: Date,
});

export default model('Order', orderSchema);