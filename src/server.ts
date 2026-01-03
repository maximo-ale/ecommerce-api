import express from 'express';
import errorHandler from './middlewares/errorHandler';

import { rateLimit, registerAndLoginLimit } from './middlewares/rate-limit';

const app = express();

import authRoutes from './entities/user/userRoutes'
import productRoutes from './entities/product/productRoutes';
import cartRoutes from './entities/cart/cartRoutes';
import orderRoutes from './entities/order/orderRoutes';
import reviewRoutes from './entities/review/reviewRoutes';
import couponRoutes from './entities/coupon/couponRoutes';
import { waitForDB } from './utils/waitForDB';

app.use(express.json());

app.use(rateLimit);

await waitForDB();

app.use('/api/auth', registerAndLoginLimit, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/coupon', couponRoutes);

app.use(errorHandler);

export default app;