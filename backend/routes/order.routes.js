const express = require('express');
const router = express.Router();
const { apiLimiter } = require('../config/env');
const { verifyAdmin } = require('../middlewares/auth.middleware');
const {
  createOrder,
  getOrders,
  updateOrderStatus,
  trackLocalOrder
} = require('../controllers/order.controller');

router.post('/orders', apiLimiter, createOrder);
router.get('/orders', verifyAdmin, getOrders);
router.put('/orders/:id/status', verifyAdmin, updateOrderStatus);
router.get('/orders/track-local', apiLimiter, trackLocalOrder);

module.exports = router;