const express = require('express');
const cors = require('cors');
const path = require('path');

const { PORT, corsOptions } = require('./config/env');
const { uploadDir } = require('./middlewares/upload.middleware');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const authRoutes = require('./routes/auth.routes');
const orderRoutes = require('./routes/order.routes');
const productRoutes = require('./routes/product.routes');
const masterRoutes = require('./routes/master.routes');
const shippingRoutes = require('./routes/shipping.routes');

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir));

app.use('/api', authRoutes);
app.use('/api', orderRoutes);
app.use('/api', productRoutes);
app.use('/api', masterRoutes);
app.use('/api', shippingRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server "Mendadak Outdoor" berjalan di port ${PORT}`);
});