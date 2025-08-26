import mongoose from 'mongoose';

const {Schema, model} = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    cart: [{
        product: {type: Schema.Types.ObjectId, ref: 'Cart'},
        quantity: {type: Number, required: true, min: 1},
    }],
});

export default model('User', userSchema);