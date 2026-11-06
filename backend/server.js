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
    courier: 'JNE',
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

app.listen(PORT, () => {
  console.log(`Server Express berjalan di http://localhost:${PORT}`);
});