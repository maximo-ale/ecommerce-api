import express from 'express';
import connectDB from './config/connectDB.js';
import errorHandler from './middlewares/errorHandler.js';

import {rateLimit, registerAndLoginLimit} from './middlewares/rate-limit.js';

const app = express();
const PORT = process.env.PORT || 3000;

import authRoutes from './entities/user/userRoutes.js'
import productRoutes from './entities/product/productRoutes.js';
import cartRoutes from './entities/cart/cartRoutes.js';
import orderRoutes from './entities/order/orderRoutes.js';
import reviewRoutes from './entities/review/reviewRoutes.js';
import couponRoutes from './entities/coupon/couponRoutes.js';

app.use(express.json());
app.use(rateLimit);

app.use('/api/auth', registerAndLoginLimit, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/coupon', couponRoutes);

app.use(errorHandler);

export default app;