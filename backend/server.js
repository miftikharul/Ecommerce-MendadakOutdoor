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

// Muat konfigurasi environment dari file .env
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_admin_token_sangat_aman';

// Batasi CORS hanya untuk domain toko
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
  shippingCost: z.number().min(0).optional()
});

const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Akses ditolak. Token tidak ditemukan.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token tidak valid.' });
    if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Akses khusus Admin.' });
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

// ==================== CHECKOUT AMAN & SERVER-SIDE PRICING ====================
app.post('/api/orders', async (req, res) => {
  try {
    const validationResult = checkoutSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Validasi gagal', 
        details: validationResult.error.errors.map(e => e.message) 
      });
    }

    const { customerName, customerPhone, shippingAddress, items, shippingCost } = validationResult.data;

    let calculatedTotalPrice = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return res.status(404).json({ error: `Produk dengan ID ${item.productId} tidak ditemukan.` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Stok produk ${product.name} tidak mencukupi!` });
      }

      calculatedTotalPrice += product.price * item.quantity;
      
      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price
      });

      await prisma.product.update({
        where: { id: product.id },
        data: { stock: product.stock - item.quantity }
      });
    }

    const finalShippingCost = shippingCost || 0;
    calculatedTotalPrice += finalShippingCost;

    const today = new Date();
    const dateStr = today.toISOString().slice(2, 10).replace(/-/g, '');
    const countToday = await prisma.order.count({
      where: {
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }
    });
    const trackingNumber = `MO-${dateStr}-${String(countToday + 1).padStart(4, '0')}`;

    const newOrder = await prisma.order.create({
      data: {
        trackingNumber,
        customerName,
        customerPhone,
        shippingAddress,
        totalPrice: calculatedTotalPrice,
        shippingCost: finalShippingCost,
        status: 'PENDING',
        items: { create: orderItemsData }
      },
      include: { items: true }
    });

    res.status(201).json({
      message: 'Pesanan berhasil dibuat dengan aman!',
      trackingNumber,
      order: newOrder
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Gagal memproses pesanan ke database.' });
  }
});

// ==================== MANAJEMEN PESANAN & ALUR STATUS ADMIN ====================
app.get('/api/orders', async (req, res) => {
  try {
    const { status, search } = req.query;
    let where = {};
    if (status && status !== 'ALL') where.status = status;
    if (search) {
      where.OR = [
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

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    const validStatuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status pesanan tidak valid.' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: status || undefined,
        trackingNumber: trackingNumber !== undefined ? trackingNumber : undefined
      },
      include: { items: true }
    });

    res.json({ message: 'Status pesanan berhasil diperbarui!', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ error: 'Gagal memperbarui status.' });
  }
});

// ==================== PRODUK & CRUD ADMIN ====================
app.get('/api/products', async (req, res) => {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(products);
});

app.post('/api/products', upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, stock, weight, variant } = req.body;
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
        price: parseFloat(price) || 0,
        stock: parseInt(stock) || 0,
        weight: parseFloat(weight) || 1.0,
        variant: variant || 'Standard',
        image: singleImagePath
      }
    });

    res.status(201).json({ success: true, message: 'Produk berhasil ditambahkan!', product: newProduct });
  } catch (error) {
    console.error('DETAIL ERROR PRODUCT:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/products/:id', upload.array('images', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, weight, variant } = req.body;
    
    let updateData = {
      name: name || undefined,
      description: description || undefined,
      price: price ? parseFloat(price) : undefined,
      stock: stock ? parseInt(stock) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      variant: variant || undefined,
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
    console.error('DETAIL ERROR UPDATE PRODUCT:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ message: 'Produk berhasil dihapus!' });
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

app.post('/api/categories', async (req, res) => {
  try {
    const { name } = req.body;
    const newCategory = await prisma.category.create({ data: { name } });
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: 'Gagal menambah kategori.' });
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

app.post('/api/brands', async (req, res) => {
  try {
    const { name } = req.body;
    const newBrand = await prisma.brand.create({ data: { name } });
    res.status(201).json(newBrand);
  } catch (error) {
    res.status(500).json({ error: 'Gagal menambah brand.' });
  }
});

// ==================== BINDERBYTE API ENDPOINTS ====================
const BB = 'https://api.binderbyte.com';
const KEY = process.env.BINDERBYTE_API_KEY;

// 1) Cari lokasi tujuan / asal (untuk dropdown alamat di checkout)
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

// 2) Hitung ongkir: berat dikirim dalam KG (weightGram / 1000)
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
      weight: String(weightGram / 1000), // Konversi gram ke kilogram
      courier: courier // contoh: 'jne', 'jnt', atau 'sicepat'
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

// 3) Lacak resi: parameter wajib menggunakan `awb` (bukan waybill)
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

app.listen(PORT, () => {
  console.log(`Server "Mendadak Outdoor" berjalan di port ${PORT}`);
});
