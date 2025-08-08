const mongoose = require('mongoose');

const {Schema, model} = mongoose;

const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    items: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
    }],
    coupon: {
        type: Schema.Types.ObjectId,
        ref: 'Coupon',
    },
});

module.exports = model('Cart', cartSchema);