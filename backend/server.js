const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
// Limit body parser JSON ditingkatkan jadi 10mb untuk menampung string Base64 gambar
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const productsFilePath = path.join(__dirname, 'products.json');
const ordersFilePath = path.join(__dirname, 'orders.json');

// API Key Binderbyte & Kota Asal Gudang
const BINDERBYTE_API_KEY = 'MASUKKAN_BINDERBYTE_API_KEY_LU'; 
const ORIGIN_CITY = 'bogor'; // Kota asal gudang Mendadak Outdoor

// Helper membaca data JSON
const readData = (filePath) => {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data || '[]');
};

// Helper menulis data JSON
const writeData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

// --- ENDPOINT PRODUK ---
app.get('/api/products', (req, res) => {
  const products = readData(productsFilePath);
  res.json({ success: true, data: products });
});

app.post('/api/products', (req, res) => {
  const products = readData(productsFilePath);
  
  const newProduct = { 
    id: Date.now().toString(), 
    name: req.body.name,
    category: req.body.category,
    price: Number(req.body.price),
    weight: Number(req.body.weight) || 1.0,
    description: req.body.description || '',
    image: req.body.image || '' // Menangkap data Base64 gambar dari admin
  };

  products.push(newProduct);
  writeData(productsFilePath, products);
  res.status(201).json({ success: true, data: newProduct });
});

app.delete('/api/products/:id', (req, res) => {
  let products = readData(productsFilePath);
  products = products.filter((p) => p.id !== req.params.id);
  writeData(productsFilePath, products);
  res.json({ success: true, message: 'Produk berhasil dihapus' });
});

// --- ENDPOINT PESANAN ---
app.get('/api/orders', (req, res) => {
  const orders = readData(ordersFilePath);
  res.json({ success: true, data: orders });
});

app.post('/api/orders', (req, res) => {
  const orders = readData(ordersFilePath);
  const newOrder = {
    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'Diproses',
    trackingNumber: '-',
    courier: req.body.courier || 'JNE',
    ...req.body,
  };
  orders.unshift(newOrder);
  writeData(ordersFilePath, orders);
  res.status(201).json({ success: true, data: newOrder });
});

// Update Status / Resi Pesanan oleh Admin
app.put('/api/orders/:id', (req, res) => {
  const orders = readData(ordersFilePath);
  const index = orders.findIndex((o) => o.id === req.params.id);

  if (index !== -1) {
    orders[index] = { ...orders[index], ...req.body };
    writeData(ordersFilePath, orders);
    return res.json({ success: true, data: orders[index] });
  }

  res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
});

// --- ENDPOINT LIVE TRACKING & CEK ONGKIR (BINDERBYTE) ---

// 1. Endpoint Live Tracking Multi-Ekspedisi (JNE, J&T, Sentral, J&T Cargo)
app.get('/api/track-resi', async (req, res) => {
  const { courier, waybill } = req.query;
  if (!courier || !waybill) {
    return res.status(400).json({ success: false, message: 'Kurir dan Resi wajib diisi!' });
  }

  try {
    const response = await fetch(
      `https://api.binderbyte.com/v1/track?api_key=${BINDERBYTE_API_KEY}&courier=${courier.toLowerCase()}&waybill=${waybill.trim()}`
    );
    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error('Error tracking:', error);
    return res.status(500).json({ success: false, message: 'Gagal terhubung ke API Kurir' });
  }
});

// 2. Endpoint Cek Ongkir Otomatis
app.get('/api/check-ongkir', async (req, res) => {
  const { destination, weight, courier } = req.query; // weight dalam gram
  if (!destination || !weight || !courier) {
    return res.status(400).json({ success: false, message: 'Data tujuan, berat, dan kurir wajib diisi!' });
  }

  try {
    const response = await fetch(
      `https://api.binderbyte.com/v1/cost?api_key=${BINDERBYTE_API_KEY}&origin=${ORIGIN_CITY}&destination=${destination.toLowerCase()}&weight=${weight}&courier=${courier.toLowerCase()}`
    );
    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error('Error cek ongkir:', error);
    return res.status(500).json({ success: false, message: 'Gagal menghitung ongkir' });
  }
});

app.listen(PORT, () => {
  console.log(`Server Express berjalan di http://localhost:${PORT}`);
});