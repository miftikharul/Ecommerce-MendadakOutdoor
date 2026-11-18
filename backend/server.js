const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET belum didefinisikan di environment variables.");
}

const allowedOrigins = ['http://localhost:3000', 'https://mendadak-outdoor.com'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Ditolak oleh kebijakan CORS.'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Hanya file gambar!'), false);
  }
});

// ==================== ZOD VALIDATION SCHEMAS ====================
const checkoutSchema = z.object({
  customerName: z.string().min(1, 'Nama wajib diisi'),
  customerPhone: z.string().regex(/^[0-9+\-\s]+$/, 'Nomor WhatsApp harus berupa angka atau format yang valid'),
  shippingAddress: z.string().min(5, 'Alamat pengiriman terlalu pendek'),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().min(1, 'Jumlah minimal 1'),
    variant: z.string().optional()
  })).min(1, 'Keranjang belanja kosong'),
  destinationId: z.string().min(1, 'Destinasi pengiriman wajib diisi'),
  courier: z.string().min(1, 'Kurir pengiriman wajib diisi'),
  serviceType: z.string().min(1, 'Jenis layanan kurir wajib diisi')
});

// ==================== AUTH MIDDLEWARES ====================
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Akses ditolak. Token tidak ditemukan.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token tidak valid atau kedaluwarsa.' });
    req.user = user;
    next();
  });
};

const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Akses ditolak. Token tidak ditemukan.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token tidak valid.' });
    req.user = user;
    next();
  });
};

// ==================== AUTH LOGIN ====================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Email atau password salah.' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Email atau password salah.' });

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ message: 'Login berhasil!', token, user: { name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
});

// ==================== CHECKOUT & TRANSAKSI ATOMIK ====================
app.post('/api/orders', async (req, res) => {
  try {
    const validationResult = checkoutSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Validasi gagal', 
        details: validationResult.error.issues.map(e => e.message) 
      });
    }

    const { customerName, customerPhone, shippingAddress, items, destinationId, courier, serviceType } = validationResult.data;

    let calculatedProductPrice = 0;
    let totalWeightGram = 0;
    const itemsValidationData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return res.status(404).json({ error: `Produk dengan ID ${item.productId} tidak ditemukan.` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Stok produk ${product.name} tidak mencukupi!` });
      }

      calculatedProductPrice += product.price * item.quantity;
      totalWeightGram += (product.weight || 1000) * item.quantity;
      
      itemsValidationData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        productName: product.name,
        variant: item.variant || product.variant || 'Standard',
        currentStock: product.stock
      });
    }

    let finalShippingCost = 0;
    const costParams = new URLSearchParams({
      api_key: process.env.BINDERBYTE_API_KEY,
      origin: process.env.BINDERBYTE_ORIGIN_ID,
      destination: destinationId,
      weight: String(totalWeightGram / 1000),
      courier: courier
    });

    const BB = 'https://api.binderbyte.com';
    const bbResponse = await fetch(`${BB}/v1/cost`, {
      method: 'POST',
      body: costParams
    });
    const bbResult = await bbResponse.json();

    if (bbResult.code === '200') {
      const allCosts = bbResult.data.results.flatMap(k => k.costs);
      const selectedCost = allCosts.find(c => c.service === serviceType);
      
      if (selectedCost) {
        finalShippingCost = Number(selectedCost.price);
      } else {
        return res.status(400).json({ error: 'Layanan kurir yang dipilih tidak valid.' });
      }
    } else {
      return res.status(400).json({ error: 'Gagal memvalidasi ongkos kirim ke server kurir.' });
    }

    const totalPrice = calculatedProductPrice + finalShippingCost;

    const today = new Date();
    const dateStr = today.toISOString().slice(2, 10).replace(/-/g, '');
    const countToday = await prisma.order.count({
      where: {
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }
    });
    const orderCode = `MO-${dateStr}-${String(countToday + 1).padStart(4, '0')}`;

    const newOrder = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderCode,
          customerName,
          customerPhone,
          shippingAddress,
          totalPrice: Math.round(totalPrice),
          shippingCost: Math.round(finalShippingCost),
          status: 'PENDING',
          items: {
            create: itemsValidationData.map(i => ({
              productId: i.productId,
              quantity: i.quantity,
              price: Math.round(i.price),
              productName: i.productName,
              variant: i.variant
            }))
          }
        },
        include: { items: true }
      });

      return created;
    });

    res.status(201).json({
      message: 'Pesanan berhasil dibuat!',
      orderCode: orderCode,
      order: newOrder
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Gagal memproses pesanan ke database.' });
  }
});

// ==================== MANAJEMEN PESANAN & STOK ====================
app.get('/api/orders', verifyAdmin, async (req, res) => {
  try {
    const { status, search } = req.query;
    let where = {};
    if (status && status !== 'ALL') where.status = status;
    if (search) {
      where.OR = [
        { orderCode: { contains: search, mode: 'insensitive' } },
        { trackingNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } }
      ];
    }
    const orders = await prisma.order.findMany({
      where,
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data pesanan.' });
  }
});

app.put('/api/orders/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    const validStatuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status pesanan tidak valid.' });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!existingOrder) return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });

    const updatedOrder = await prisma.$transaction(async (tx) => {
      if (status === 'PAID' && existingOrder.status !== 'PAID' && existingOrder.status !== 'COMPLETED' && existingOrder.status !== 'SHIPPED') {
        for (const item of existingOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          });
        }
      }

      if (status === 'CANCELLED' && existingOrder.status === 'PAID') {
        for (const item of existingOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } }
          });
        }
      }

      const updatePayload = {};
      if (status) updatePayload.status = status;
      if (trackingNumber !== undefined && trackingNumber.trim() !== '') {
        updatePayload.trackingNumber = trackingNumber;
      }

      return await tx.order.update({
        where: { id },
        data: updatePayload,
        include: { items: true }
      });
    });

    res.json({ message: 'Status dan resi pesanan berhasil diperbarui!', order: updatedOrder });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Gagal memperbarui status.' });
  }
});

// ==================== PRODUK ====================
app.get('/api/products', async (req, res) => {
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
});

app.get('/api/products/:id', async (req, res) => {
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
});

app.post('/api/products', verifyAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, stock, weight, variant, categoryId, brandId } = req.body;
    let singleImagePath = null;
    
    if (req.files && req.files.length > 0) {
      const file = req.files[0];
      const filename = `product-${Date.now()}-${Math.round(Math.random() * 1000)}.webp`;
      const outputPath = path.join(uploadDir, filename);
      await sharp(file.buffer).resize(800, 800, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toFile(outputPath);
      singleImagePath = `/uploads/${filename}`;
    }

    const newProduct = await prisma.product.create({
      data: {
        name: name || 'Produk Tanpa Nama',
        description: description || '-',
        price: parseInt(price) || 0,
        stock: parseInt(stock) || 0,
        weight: parseFloat(weight) || 1000,
        variant: variant || 'Standard',
        image: singleImagePath,
        categoryId: (categoryId && categoryId !== '') ? categoryId : null,
        brandId: (brandId && brandId !== '') ? brandId : null
      }
    });

    res.status(201).json({ success: true, message: 'Produk berhasil ditambahkan!', product: newProduct });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/products/:id', verifyAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, weight, variant, categoryId, brandId } = req.body;
    
    let updateData = {
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
      const file = req.files[0];
      const filename = `product-${Date.now()}-${Math.round(Math.random() * 1000)}.webp`;
      const outputPath = path.join(uploadDir, filename);
      await sharp(file.buffer).resize(800, 800, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toFile(outputPath);
      updateData.image = `/uploads/${filename}`;
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    res.json({ success: true, message: 'Produk berhasil diperbarui!', product: updatedProduct });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/products/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Produk berhasil dihapus!' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Gagal menghapus produk.' });
  }
});

// ==================== KATEGORI & BRAND MASTER ====================
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Gagal memuat kategori.' });
  }
});

app.post('/api/categories', verifyAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    const newCategory = await prisma.category.create({ data: { name } });
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error create category:", error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Kategori dengan nama tersebut sudah ada!' });
    }
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/categories/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Kategori berhasil dihapus!' });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ error: 'Gagal menghapus kategori.' });
  }
});

app.get('/api/brands', async (req, res) => {
  try {
    const brands = await prisma.brand.findMany();
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: 'Gagal memuat brand.' });
  }
});

app.post('/api/brands', verifyAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    const newBrand = await prisma.brand.create({ data: { name } });
    res.status(201).json(newBrand);
  } catch (error) {
    console.error("Error create brand:", error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Brand dengan nama tersebut sudah ada!' });
    }
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/brands/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.brand.delete({ where: { id } });
    res.json({ message: 'Brand berhasil dihapus!' });
  } catch (error) {
    console.error("Delete brand error:", error);
    res.status(500).json({ error: 'Gagal menghapus brand.' });
  }
});

// ==================== BINDERBYTE API ENDPOINTS ====================
const BB = 'https://api.binderbyte.com';
const KEY = process.env.BINDERBYTE_API_KEY;

app.get('/api/locations', async (req, res) => {
  try {
    const url = `${BB}/v1/locations?api_key=${KEY}&search=${encodeURIComponent(req.query.q || '')}`;
    const response = await fetch(url);
    const r = await response.json();
    res.json(r.data || []);
  } catch (e) {
    console.error('Locations error:', e);
    res.status(502).json({ message: 'Gagal mencari lokasi' });
  }
});

app.post('/api/check-ongkir', async (req, res) => {
  try {
    const { destinationId, weightGram, courier } = req.body;
    if (!destinationId || !weightGram || !courier) {
      return res.status(400).json({ message: 'Destinasi, berat, dan kurir wajib diisi.' });
    }

    const body = new URLSearchParams({
      api_key: KEY,
      origin: process.env.BINDERBYTE_ORIGIN_ID,
      destination: destinationId,
      weight: String(weightGram / 1000),
      courier: courier
    });

    const response = await fetch(`${BB}/v1/cost`, {
      method: 'POST',
      body
    });
    const r = await response.json();

    if (r.code !== '200') {
      return res.status(400).json({ message: r.message || 'Gagal menghitung ongkir' });
    }

    const options = r.data.results.flatMap((k) =>
      k.costs.map((c) => ({
        courier: k.code.toUpperCase(),
        service: c.service,
        price: Number(c.price),
        estimated: c.estimated,
      }))
    );

    res.json(options);
  } catch (e) {
    console.error('Check ongkir error:', e);
    res.status(502).json({ message: 'Gagal menghitung ongkir' });
  }
});

app.get('/api/track-resi', async (req, res) => {
  try {
    const { courier, awb } = req.query;
    if (!courier || !awb) {
      return res.status(400).json({ status: 400, message: 'Kurir dan nomor resi (awb) wajib diisi.' });
    }

    const url = `${BB}/v1/track?api_key=${KEY}&courier=${courier}&awb=${encodeURIComponent(awb)}`;
    const response = await fetch(url);
    const r = await response.json();

    if (r.status !== 200) {
      return res.status(400).json({ status: r.status, message: r.message || 'Resi tidak ditemukan' });
    }

    res.json(r.data);
  } catch (e) {
    console.error('Tracking error:', e);
    res.status(502).json({ status: 502, message: 'Gagal melacak resi' });
  }
});

// ==================== LACAK LOKAL (Dua Input Wajib & Filter Data Aman) ====================
app.get('/api/orders/track-local', async (req, res) => {
  try {
    const { query, phone } = req.query;
    
    if (!query || !phone || !query.trim() || !phone.trim()) {
      return res.status(400).json({ error: 'Kode pesanan dan nomor WhatsApp wajib diisi lengkap.' });
    }

    const orders = await prisma.order.findMany({
      where: {
        orderCode: query.trim(),
        customerPhone: phone.trim()
      },
      include: { 
        items: {
          select: {
            productName: true,
            quantity: true,
            price: true,
            variant: true
          }
        } 
      },
      orderBy: { createdAt: 'desc' }
    });

    const sanitizedOrders = orders.map(order => ({
      id: order.id,
      orderCode: order.orderCode,
      customerName: order.customerName,
      status: order.status,
      trackingNumber: order.trackingNumber || '-',
      shippingCost: order.shippingCost,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
      items: order.items
    }));

    res.json(sanitizedOrders);
  } catch (error) {
    console.error('Track local error:', error);
    res.status(500).json({ error: 'Gagal mencari data pesanan.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server "Mendadak Outdoor" berjalan di port ${PORT}`);
});