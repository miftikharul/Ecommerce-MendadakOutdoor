'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Toast from '@/components/Toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function AdminPage() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [email, setEmail] = useState('');
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

  // Toast Notifikasi State (Poin 22)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Form Produk State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [weight, setWeight] = useState('1000');
  const [variant, setVariant] = useState('Standard');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Master (Kategori & Brand)
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');

  // Filter Pesanan State
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // State Input Resi per Order (Poin 19)
  const [resiInputs, setResiInputs] = useState<{ [key: string]: string }>({});

  // Helper untuk mendapatkan Header berisikan JWT Token
  const getAuthHeaders = () => {
    const token = sessionStorage.getItem('admin_token');
    return {
      'Authorization': `Bearer ${token}`
    };
  };

  // Cek sesi login saat halaman dimuat
  useEffect(() => {
    const token = sessionStorage.getItem('admin_token');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsCheckingAuth(false);
  }, []);

  const fetchData = async () => {
    try {
      const headers = getAuthHeaders();
      const [prodRes, ordRes, catRes, brandRes] = await Promise.all([
        fetch(`${API_URL}/api/products`, { headers }),
        fetch(`${API_URL}/api/orders?status=${statusFilter}&search=${searchQuery}`, { headers }),
        fetch(`${API_URL}/api/categories`, { headers }).catch(() => ({ ok: false })),
        fetch(`${API_URL}/api/brands`, { headers }).catch(() => ({ ok: false }))
      ]);
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }
      if (ordRes.ok) {
        const ordData = await ordRes.json();
        setOrders(ordData);
        const initialResi: { [key: string]: string } = {};
        ordData.forEach((o: any) => {
          initialResi[o.id] = o.trackingNumber || '';
        });
        setResiInputs(initialResi);
      }
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

  // Handler Login Admin dengan /api/auth/login (JWT + bcrypt)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        sessionStorage.setItem('admin_token', data.token);
        setIsAuthenticated(true);
        showToast('Berhasil masuk ke Panel Admin!');
      } else {
        setLoginError(data.error || 'Email atau password salah!');
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
    setEmail('');
    setPassword('');
    showToast('Berhasil keluar sesi admin.');
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
      formData.append('weight', weight);
      formData.append('variant', variant);
      if (categoryId) formData.append('categoryId', categoryId);
      if (brandId) formData.append('brandId', brandId);
      if (imageFile) formData.append('images', imageFile);

      const url = editingId 
        ? `${API_URL}/api/products/${editingId}` 
        : `${API_URL}/api/products`;
      
      const res = await fetch(url, { 
        method: editingId ? 'PUT' : 'POST', 
        headers: getAuthHeaders(),
        body: formData 
      });

      if (res.ok) {
        showToast(editingId ? 'Produk berhasil diperbarui!' : 'Produk baru berhasil ditambahkan!');
        setName(''); setDescription(''); setPrice(''); setStock(''); setWeight('1000'); setCategoryId(''); setBrandId(''); setImageFile(null); setEditingId(null);
        fetchData();
      } else {
        showToast('Gagal menyimpan produk.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;
    const res = await fetch(`${API_URL}/api/categories`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ name: newCategoryName })
    });
    if (res.ok) {
      setNewCategoryName('');
      fetchData();
      showToast('Kategori berhasil ditambahkan!');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Hapus kategori "${name}"?`)) return;
    const res = await fetch(`${API_URL}/api/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (res.ok) {
      fetchData();
      showToast('Kategori berhasil dihapus.');
    }
  };

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName) return;
    const res = await fetch(`${API_URL}/api/brands`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ name: newBrandName })
    });
    if (res.ok) {
      setNewBrandName('');
      fetchData();
      showToast('Brand berhasil ditambahkan!');
    }
  };

  const handleDeleteBrand = async (id: string, name: string) => {
    if (!confirm(`Hapus brand "${name}"?`)) return;
    const res = await fetch(`${API_URL}/api/brands/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (res.ok) {
      fetchData();
      showToast('Brand berhasil dihapus.');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Hapus produk "${name}"?`)) return;
    const res = await fetch(`${API_URL}/api/products/${id}`, { 
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (res.ok) {
      fetchData();
      showToast('Produk berhasil dihapus.');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    const trackingNumber = resiInputs[orderId] || '';
    const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ status, trackingNumber })
    });
    if (res.ok) {
      fetchData();
      showToast(`Status pesanan diperbarui ke ${status}!`);
    } else {
      showToast('Gagal memperbarui status pesanan.');
    }
  };

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
              <label className="block text-gray-400 mb-1">Email Admin</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mendadakoutdoor.com"
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
              className="w-full bg-orange-600 hover:bg-orange-500 py-2.5 rounded-lg font-bold text-white transition mt-2 cursor-pointer"
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

        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
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
            <button onClick={() => setActiveTab('products')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${activeTab === 'products' ? 'bg-orange-600' : 'bg-[#1e293b]'}`}>Produk</button>
            <button onClick={() => setActiveTab('orders')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${activeTab === 'orders' ? 'bg-orange-600' : 'bg-[#1e293b]'}`}>Pesanan ({orders.length})</button>
            <button onClick={() => setActiveTab('master')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${activeTab === 'master' ? 'bg-orange-600' : 'bg-[#1e293b]'}`}>Kategori & Brand</button>
            <Link href="/" className="bg-gray-800 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center">Toko</Link>
            <button onClick={handleLogout} className="bg-red-600/80 hover:bg-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer">Keluar</button>
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
                <div className="grid grid-cols-3 gap-3">
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Harga (Rp)" required className="bg-[#0f172a] p-2.5 rounded-lg border border-gray-700 text-white" />
                  <input type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="Stok" required className="bg-[#0f172a] p-2.5 rounded-lg border border-gray-700 text-white" />
                  <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Berat (gram)" required className="bg-[#0f172a] p-2.5 rounded-lg border border-gray-700 text-white" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Varian</label>
                    <select value={variant} onChange={e => setVariant(e.target.value)} className="w-full bg-[#0f172a] p-2.5 rounded-lg border border-gray-700 text-white">
                      {['Standard', 'Aksesoris', 'Tenda', 'Meja', 'Kompor', 'Lampu'].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Kategori</label>
                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full bg-[#0f172a] p-2.5 rounded-lg border border-gray-700 text-white">
                      <option value="">Pilih Kategori...</option>
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Brand</label>
                  <select value={brandId} onChange={e => setBrandId(e.target.value)} className="w-full bg-[#0f172a] p-2.5 rounded-lg border border-gray-700 text-white">
                    <option value="">Pilih Brand...</option>
                    {brands.map((b: any) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Deskripsi..." rows={2} className="w-full bg-[#0f172a] p-2.5 rounded-lg border border-gray-700 text-white" />
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="w-full text-gray-400" />
                <button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-500 py-2.5 rounded-lg font-bold text-white cursor-pointer">{loading ? 'Menyimpan...' : 'Simpan Produk'}</button>
              </form>
            </div>

            <div className="bg-[#1e293b] p-5 rounded-xl border border-gray-800 space-y-2">
              <h2 className="text-xs font-bold uppercase mb-3">Daftar Produk ({products.length})</h2>
              {products.map((p: any) => (
                <div key={p.id} className="flex justify-between items-center bg-[#0f172a] p-3 rounded-lg border border-gray-800 text-xs">
                  <div>
                    <span className="font-bold text-white">{p.name}</span>
                    <span className="text-gray-400 ml-2">({p.variant})</span>
                    {p.category && <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded ml-2 text-[10px]">{p.category.name}</span>}
                    {p.brand && <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded ml-2 text-[10px]">{p.brand.name}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-orange-400 font-semibold">Rp {Number(p.price).toLocaleString('id-ID')}</span>
                    <button onClick={() => handleEditProduct(p)} className="text-blue-400 hover:underline cursor-pointer">Edit</button>
                    <button onClick={() => handleDeleteProduct(p.id, p.name)} className="text-red-400 hover:underline cursor-pointer">Hapus</button>
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
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-[#0f172a] p-2 rounded-lg border border-gray-700 text-white cursor-pointer">
                {['ALL', 'PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              {orders.map((o: any) => (
                <div key={o.id} className="bg-[#0f172a] p-4 rounded-xl border border-gray-800 space-y-3">
                  <div className="flex justify-between font-bold">
                    <span className="text-orange-400">{o.orderCode}</span>
                    <span className="text-yellow-400">{o.status}</span>
                  </div>
                  <p className="text-gray-300">Pembeli: {o.customerName} ({o.customerPhone}) | Total: Rp {Number(o.totalPrice).toLocaleString('id-ID')}</p>
                  
                  {/* Form Input Resi Pengiriman */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-800">
                    <input 
                      type="text"
                      value={resiInputs[o.id] ?? ''}
                      onChange={(e) => setResiInputs({ ...resiInputs, [o.id]: e.target.value })}
                      placeholder="Masukkan No. Resi (AWB)..."
                      className="flex-1 bg-[#1e293b] text-white px-3 py-1.5 rounded border border-gray-700 text-xs focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>

                  <div className="flex gap-2 pt-1 flex-wrap items-center">
                    <span className="text-gray-400 text-[11px] mr-1">Ubah Status:</span>
                    {['PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'].map(st => (
                      <button 
                        key={st} 
                        onClick={() => handleUpdateOrderStatus(o.id, st)} 
                        className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition ${o.status === st ? 'bg-orange-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}
                      >
                        {st}
                      </button>
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
                <button type="submit" className="bg-orange-600 hover:bg-orange-500 px-4 py-2.5 rounded-lg font-bold text-white cursor-pointer">Tambah</button>
              </form>
              <div className="space-y-2 pt-2 max-h-60 overflow-y-auto">
                {categories.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Belum ada kategori.</p>
                ) : (
                  categories.map((cat: any) => (
                    <div key={cat.id} className="bg-[#0f172a] p-3 rounded-lg border border-gray-800 text-white flex justify-between items-center">
                      <span className="font-medium">{cat.name}</span>
                      <button 
                        onClick={() => handleDeleteCategory(cat.id, cat.name)} 
                        className="text-red-400 hover:text-red-300 text-xs px-2 py-1 bg-red-500/10 rounded border border-red-500/20 cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Kelola Brand */}
            <div className="bg-[#1e293b] p-5 rounded-xl border border-gray-800 space-y-4">
              <h2 className="font-bold uppercase text-white">Kelola Brand</h2>
              <form onSubmit={handleAddBrand} className="flex gap-2">
                <input type="text" value={newBrandName} onChange={e => setNewBrandName(e.target.value)} placeholder="Nama Brand Baru..." required className="flex-1 bg-[#0f172a] p-2.5 rounded-lg border border-gray-700 text-white" />
                <button type="submit" className="bg-orange-600 hover:bg-orange-500 px-4 py-2.5 rounded-lg font-bold text-white cursor-pointer">Tambah</button>
              </form>
              <div className="space-y-2 pt-2 max-h-60 overflow-y-auto">
                {brands.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Belum ada brand.</p>
                ) : (
                  brands.map((b: any) => (
                    <div key={b.id} className="bg-[#0f172a] p-3 rounded-lg border border-gray-800 text-white flex justify-between items-center">
                      <span className="font-medium">{b.name}</span>
                      <button 
                        onClick={() => handleDeleteBrand(b.id, b.name)} 
                        className="text-red-400 hover:text-red-300 text-xs px-2 py-1 bg-red-500/10 rounded border border-red-500/20 cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Komponen Toast Notifikasi */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </main>
  );

  function handleEditProduct(p: any) {
    setEditingId(p.id); 
    setName(p.name); 
    setDescription(p.description || ''); 
    setPrice(p.price); 
    setStock(p.stock); 
    setWeight(p.weight || '1000'); 
    setVariant(p.variant || 'Standard');
    setCategoryId(p.categoryId || '');
    setBrandId(p.brandId || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}