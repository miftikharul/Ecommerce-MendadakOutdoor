'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Admin Dashboard State
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'master'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [todayStr, setTodayStr] = useState('');

  // Form Produk State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [variant, setVariant] = useState('Standard');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Master (Kategori & Brand)
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');

  // Filter Pesanan State
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Cek sesi login saat halaman dimuat
  useEffect(() => {
    const token = sessionStorage.getItem('admin_token');
    if (token === 'admin-authenticated-session-token') {
      setIsAuthenticated(true);
    }
    setIsCheckingAuth(false);
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, ordRes, catRes, brandRes] = await Promise.all([
        fetch('http://localhost:5000/api/products'),
        fetch(`http://localhost:5000/api/orders?status=${statusFilter}&search=${searchQuery}`),
        fetch('http://localhost:5000/api/categories').catch(() => ({ ok: false })),
        fetch('http://localhost:5000/api/brands').catch(() => ({ ok: false }))
      ]);
      if (prodRes.ok) setProducts(await prodRes.json());
      if (ordRes.ok) setOrders(await ordRes.json());
      if (catRes.ok && 'json' in catRes) setCategories(await catRes.json());
      if (brandRes.ok && 'json' in brandRes) setBrands(await brandRes.json());
    } catch (error) {
      console.error('Gagal memuat data admin:', error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    setTodayStr(new Date().toISOString().slice(0, 10));
    fetchData();
  }, [isAuthenticated, statusFilter, searchQuery]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        sessionStorage.setItem('admin_token', data.token);
        setIsAuthenticated(true);
      } else {
        setLoginError(data.message || 'Username atau password salah!');
      }
    } catch (error) {
      setLoginError('Gagal terhubung ke server backend.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('stock', stock);
      formData.append('variant', variant);
      if (imageFile) formData.append('images', imageFile);

      const url = editingId ? `http://localhost:5000/api/products/${editingId}` : 'http://localhost:5000/api/products';
      const res = await fetch(url, { method: editingId ? 'PUT' : 'POST', body: formData });

      if (res.ok) {
        alert(editingId ? 'Produk diperbarui!' : 'Produk ditambahkan!');
        setName(''); setDescription(''); setPrice(''); setStock(''); setImageFile(null); setEditingId(null);
        fetchData();
      } else {
        alert('Gagal menyimpan produk.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;
    const res = await fetch('http://localhost:5000/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategoryName })
    });
    if (res.ok) {
      setNewCategoryName('');
      fetchData();
      alert('Kategori berhasil ditambahkan!');
    }
  };

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName) return;
    const res = await fetch('http://localhost:5000/api/brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newBrandName })
    });
    if (res.ok) {
      setNewBrandName('');
      fetchData();
      alert('Brand berhasil ditambahkan!');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Hapus produk "${name}"?`)) return;
    const res = await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string, currentResi: string) => {
    const trackingNumber = prompt('Masukkan Nomor Resi Pengiriman:', currentResi || '');
    if (trackingNumber === null) return;
    const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, trackingNumber })
    });
    if (res.ok) fetchData();
  };

  // Mencegah kedipan layar saat mengecek sessionStorage
  if (isCheckingAuth) {
    return <main className="min-h-screen bg-[#0b132b]" />;
  }

  // GERBANG LOGIN ADMIN
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#0b132b] text-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-[#1e293b] p-6 rounded-xl border border-gray-800 space-y-5 shadow-xl">
          <div className="text-center space-y-1">
            <h1 className="text-lg font-bold text-white">🔒 Login Admin</h1>
            <p className="text-xs text-gray-400">Mendadak Outdoor Store</p>
          </div>

          {loginError && (
            <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-xs p-3 rounded-lg text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-400 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username admin"
                required
                className="w-full bg-[#0f172a] p-2.5 rounded-lg border border-gray-700 text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password admin"
                required
                className="w-full bg-[#0f172a] p-2.5 rounded-lg border border-gray-700 text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-orange-600 hover:bg-orange-500 py-2.5 rounded-lg font-bold text-white transition mt-2"
            >
              {loginLoading ? 'Memverifikasi...' : 'Masuk Panel Admin'}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-gray-800">
            <Link href="/" className="text-xs text-gray-400 hover:text-white">
              ← Kembali ke Toko
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const todayOrders = orders.filter(o => o.createdAt && o.createdAt.slice(0, 10) === todayStr);

  return (
    <main className="min-h-screen bg-[#0b132b] text-slate-100 p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center border-b border-gray-800 pb-4">
          <h1 className="text-xl font-bold text-white">⚙️ Panel Admin</h1>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('products')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'products' ? 'bg-orange-600' : 'bg-[#1e293b]'}`}>Produk</button>
            <button onClick={() => setActiveTab('orders')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'orders' ? 'bg-orange-600' : 'bg-[#1e293b]'}`}>Pesanan ({orders.length})</button>
            <button onClick={() => setActiveTab('master')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'master' ? 'bg-orange-600' : 'bg-[#1e293b]'}`}>Kategori & Brand</button>
            <Link href="/" className="bg-gray-800 px-3 py-1.5 rounded-lg text-xs font-semibold">Toko</Link>
            <button onClick={handleLogout} className="bg-red-600/80 hover:bg-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold text-white">Keluar</button>
          </div>
        </div>

        {/* Ringkasan */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-800">
            <p className="text-[10px] text-gray-400 uppercase">Masuk Hari Ini</p>
            <h3 className="text-lg font-bold text-white">{todayOrders.length} Pesanan</h3>
          </div>
          <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-800">
            <p className="text-[10px] text-gray-400 uppercase">Pending</p>
            <h3 className="text-lg font-bold text-orange-400">{orders.filter(o => o.status === 'PENDING').length} Pesanan</h3>
          </div>
        </div>

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-[#1e293b] p-5 rounded-xl border border-gray-800">
              <h2 className="text-xs font-bold uppercase mb-3">{editingId ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
              <form onSubmit={handleProductSubmit} className="space-y-3 text-xs">
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nama Produk" required className="w-full bg-[#0f172a] p-2.5 rounded-lg border border-gray-700 text-white" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Harga (Rp)" required className="bg-[#0f172a] p-2.5 rounded-lg border border-gray-700 text-white" />
                  <input type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="Stok" required className="bg-[#0f172a] p-2.5 rounded-lg border border-gray-700 text-white" />
                </div>
                <select value={variant} onChange={e => setVariant(e.target.value)} className="w-full bg-[#0f172a] p-2.5 rounded-lg border border-gray-700 text-white">
                  {['Standard', 'Aksesoris', 'Tenda', 'Meja', 'Kompor', 'Lampu'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Deskripsi..." rows={2} className="w-full bg-[#0f172a] p-2.5 rounded-lg border border-gray-700 text-white" />
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="w-full text-gray-400" />
                <button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-500 py-2.5 rounded-lg font-bold text-white">{loading ? 'Menyimpan...' : 'Simpan Produk'}</button>
              </form>
            </div>

            <div className="bg-[#1e293b] p-5 rounded-xl border border-gray-800 space-y-2">
              <h2 className="text-xs font-bold uppercase mb-3">Daftar Produk ({products.length})</h2>
              {products.map((p: any) => (
                <div key={p.id} className="flex justify-between items-center bg-[#0f172a] p-3 rounded-lg border border-gray-800 text-xs">
                  <div>
                    <span className="font-bold text-white">{p.name}</span>
                    <span className="text-gray-400 ml-2">({p.variant})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-orange-400 font-semibold">Rp {Number(p.price).toLocaleString('id-ID')}</span>
                    <button onClick={() => handleEditProduct(p)} className="text-blue-400 hover:underline">Edit</button>
                    <button onClick={() => handleDeleteProduct(p.id, p.name)} className="text-red-400 hover:underline">Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-[#1e293b] p-5 rounded-xl border border-gray-800 space-y-4 text-xs">
            <div className="flex gap-3">
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Cari kode/nama..." className="flex-1 bg-[#0f172a] p-2 rounded-lg border border-gray-700 text-white" />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-[#0f172a] p-2 rounded-lg border border-gray-700 text-white">
                {['ALL', 'PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              {orders.map((o: any) => (
                <div key={o.id} className="bg-[#0f172a] p-4 rounded-xl border border-gray-800 space-y-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-orange-400">{o.trackingNumber}</span>
                    <span className="text-yellow-400">{o.status}</span>
                  </div>
                  <p className="text-gray-300">Pembeli: {o.customerName} | Total: Rp {Number(o.totalPrice).toLocaleString('id-ID')}</p>
                  <div className="flex gap-2 pt-2 border-t border-gray-800">
                    {['PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED'].map(st => (
                      <button key={st} onClick={() => handleUpdateOrderStatus(o.id, st, o.trackingNumber)} className="bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded text-[10px]">{st}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'master' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Kelola Kategori */}
            <div className="bg-[#1e293b] p-5 rounded-xl border border-gray-800 space-y-4">
              <h2 className="font-bold uppercase text-white">Kelola Kategori</h2>
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="Nama Kategori Baru..." required className="flex-1 bg-[#0f172a] p-2.5 rounded-lg border border-gray-700 text-white" />
                <button type="submit" className="bg-orange-600 hover:bg-orange-500 px-4 py-2.5 rounded-lg font-bold text-white">Tambah</button>
              </form>
              <div className="space-y-2 pt-2">
                {categories.map((cat: any) => (
                  <div key={cat.id || cat.name} className="bg-[#0f172a] p-2.5 rounded-lg border border-gray-800 text-white flex justify-between items-center">
                    <span>{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Kelola Brand */}
            <div className="bg-[#1e293b] p-5 rounded-xl border border-gray-800 space-y-4">
              <h2 className="font-bold uppercase text-white">Kelola Brand</h2>
              <form onSubmit={handleAddBrand} className="flex gap-2">
                <input type="text" value={newBrandName} onChange={e => setNewBrandName(e.target.value)} placeholder="Nama Brand Baru..." required className="flex-1 bg-[#0f172a] p-2.5 rounded-lg border border-gray-700 text-white" />
                <button type="submit" className="bg-orange-600 hover:bg-orange-500 px-4 py-2.5 rounded-lg font-bold text-white">Tambah</button>
              </form>
              <div className="space-y-2 pt-2">
                {brands.map((b: any) => (
                  <div key={b.id || b.name} className="bg-[#0f172a] p-2.5 rounded-lg border border-gray-800 text-white flex justify-between items-center">
                    <span>{b.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );

  function handleEditProduct(p: any) {
    setEditingId(p.id); setName(p.name); setDescription(p.description || ''); setPrice(p.price); setStock(p.stock); setVariant(p.variant || 'Standard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}