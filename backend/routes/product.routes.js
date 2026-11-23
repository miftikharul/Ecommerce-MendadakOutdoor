const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/upload.middleware');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/product.controller');

router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.post('/products', verifyAdmin, upload.array('images', 5), createProduct);
router.put('/products/:id', verifyAdmin, upload.array('images', 5), updateProduct);
router.delete('/products/:id', verifyAdmin, deleteProduct);

module.exports = router;