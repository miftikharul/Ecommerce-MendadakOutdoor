const sharp = require('sharp');
const path = require('path');
const { prisma } = require('../config/env');
const { uploadDir } = require('../middlewares/upload.middleware');

const MAX_PRODUCT_IMAGES = 5;

const processUploadedImages = async (files) => {
  if (!Array.isArray(files) || files.length === 0) {
    return [];
  }

  const savedImages = [];
  const filesToProcess = files.slice(0, MAX_PRODUCT_IMAGES);

  for (let i = 0; i < filesToProcess.length; i++) {
    const file = filesToProcess[i];
    const filename = `product-${Date.now()}-${i}-${Math.round(Math.random() * 1000)}.webp`;
    const outputPath = path.join(uploadDir, filename);

    await sharp(file.buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);

    savedImages.push(`/uploads/${filename}`);
  }

  return savedImages;
};

const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true, brand: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Gagal memuat daftar produk.' });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, brand: true }
    });
    if (!product) return res.status(404).json({ error: 'Produk tidak ditemukan.' });
    res.json(product);
  } catch (error) {
    console.error('Get product detail error:', error);
    res.status(500).json({ error: 'Gagal mengambil detail produk.' });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, weight, variant, categoryId, brandId } = req.body;
    const savedImages = await processUploadedImages(req.files);

    const newProduct = await prisma.product.create({
      data: {
        name: name || 'Produk Tanpa Nama',
        description: description || '-',
        price: parseInt(price) || 0,
        stock: parseInt(stock) || 0,
        weight: parseFloat(weight) || 1000,
        variant: variant || 'Standard',
        image: savedImages[0] || null,
        images: savedImages,
        categoryId: (categoryId && categoryId !== '') ? categoryId : null,
        brandId: (brandId && brandId !== '') ? brandId : null
      }
    });

    res.status(201).json({ success: true, message: 'Produk berhasil ditambahkan!', product: newProduct });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, error: 'Gagal menambahkan produk.' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, weight, variant, categoryId, brandId } = req.body;

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return res.status(404).json({ success: false, error: 'Produk tidak ditemukan.' });
    }

    const updateData = {
      name: name || undefined,
      description: description || undefined,
      price: price ? parseInt(price) : undefined,
      stock: stock ? parseInt(stock) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      variant: variant || undefined,
      categoryId: (categoryId && categoryId !== '') ? categoryId : null,
      brandId: (brandId && brandId !== '') ? brandId : null
    };

    if (req.files && req.files.length > 0) {
      const savedImages = await processUploadedImages(req.files);
      updateData.image = savedImages[0] || existingProduct.image || null;
      updateData.images = savedImages;
    } else {
      updateData.images = Array.isArray(existingProduct.images) && existingProduct.images.length > 0
        ? existingProduct.images
        : existingProduct.image
          ? [existingProduct.image]
          : [];
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    res.json({ success: true, message: 'Produk berhasil diperbarui!', product: updatedProduct });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, error: 'Gagal memperbarui produk.' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Produk berhasil dihapus!' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Gagal menghapus produk.' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};