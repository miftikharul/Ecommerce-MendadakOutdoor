const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middlewares/auth.middleware');
const {
  getCategories,
  createCategory,
  deleteCategory,
  getBrands,
  createBrand,
  deleteBrand
} = require('../controllers/master.controller');

router.get('/categories', getCategories);
router.post('/categories', verifyAdmin, createCategory);
router.delete('/categories/:id', verifyAdmin, deleteCategory);

router.get('/brands', getBrands);
router.post('/brands', verifyAdmin, createBrand);
router.delete('/brands/:id', verifyAdmin, deleteBrand);

module.exports = router;