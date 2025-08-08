const express = require('express');
const connectDB = require('./config/connectDB');
const app = express();
const PORT = process.env.PORT || 3000;
const { errorHandler } = require('./middlewares/errorHandler');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const couponRoutes = require('./routes/couponRoutes');

app.use(express.json());
app.use(errorHandler);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/coupon', couponRoutes);

connectDB()
    .then(() => {
        app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
    });