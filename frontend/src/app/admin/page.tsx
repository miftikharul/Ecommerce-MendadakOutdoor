'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Package, ShoppingCart, Plus, Trash2, ArrowLeft, Lock, LogOut, Image as ImageIcon, Upload } from 'lucide-react';

function AdminContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('orders');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  
  const [form, setForm] = useState({ name: '', category: 'Tenda', price: '', weight: '1', description: '-', image: '' });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (localStorage.getItem('admin_session') === 'authenticated') {
      setIsLoggedIn(true);
      loadData();
    }
  }, []);

  const loadData = () => {
    fetch('http://localhost:5000/api/products').then(res => res.json()).then(d => setProducts(d.success ? d.data : []));
    fetch('http://localhost:5000/api/orders').then(res => res.json()).then(d => setOrders(d.success ? d.data : []));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('admin_session', 'authenticated');
      setIsLoggedIn(true);
      setErrorMsg('');
      loadData();
    } else {
      setErrorMsg('Username atau password salah! (admin / admin123)');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { alert('Maksimal ukuran file 2MB!'); return; }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setForm(prev => ({ ...prev, image: base64 }));
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    }).then(res => res.json()).then(d => {
      if (d.success) {
        alert('Produk berhasil ditambahkan!');
        setForm({ name: '', category: 'Tenda', price: '', weight: '1', description: '-', image: '' });
        setImagePreview(null);
        loadData();
      }
    });
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Hapus produk ini?')) {
      fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' }).then(() => loadData());
    }
  };

  const handleUpdateStatus = (id: string, status: string, curResi: string) => {
    const trackingNumber = prompt('Masukkan No. Resi:', curResi !== '-' ? curResi : '');
    fetch(`http://localhost:5000/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, trackingNumber: trackingNumber || curResi }),
    }).then(() => loadData());
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0B132B] text-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-[#1C2541] p-8 rounded-3xl border border-slate-700/80 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-orange-500/20 text-orange-400 rounded-2xl flex items-center justify-center mx-auto border border-orange-500/30">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-white">Login Admin</h1>
          </div>
          {errorMsg && <div className="bg-red-500/20 text-red-400 text-xs p-3 rounded-xl text-center">{errorMsg}</div>}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <input type="text" placeholder="Username" required value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-[#0B132B] border border-slate-700 rounded-xl px-4 py-3 text-white" />
            <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#0B132B] border border-slate-700 rounded-xl px-4 py-3 text-white" />
            <button type="submit" className="w-full bg-orange-500 font-bold py-3 rounded-xl cursor-pointer">Masuk</button>
          </form>
          <div className="text-center"><Link href="/" className="text-xs text-slate-400 hover:text-white">Kembali ke Beranda</Link></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <h1 className="text-xl font-black text-white">Panel Admin Mendadak Outdoor</h1>
          <div className="space-x-3">
            <button onClick={() => { localStorage.removeItem('admin_session'); setIsLoggedIn(false); }} className="bg-red-500/20 text-red-400 text-xs px-4 py-2.5 rounded-xl cursor-pointer">Logout</button>
            <Link href="/" className="bg-slate-700 text-xs px-4 py-2.5 rounded-xl">Ke Beranda</Link>
          </div>
        </div>

        <div className="flex space-x-3 border-b border-slate-800 pb-2">
          <button onClick={() => setActiveTab('orders')} className={`px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer ${activeTab === 'orders' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}>Pesanan ({orders.length})</button>
          <button onClick={() => setActiveTab('products')} className={`px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer ${activeTab === 'products' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}>Produk ({products.length})</button>
        </div>

        {activeTab === 'orders' ? (
          <div className="space-y-4">
            {orders.map(o => (
              <div key={o.id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-3 text-xs">
                <div className="flex justify-between font-bold text-orange-400"><span>{o.id} - {o.customerName}</span><span>{o.status}</span></div>
                <div className="bg-slate-900/50 p-3 rounded-xl space-y-1">
                  {o.items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between"><span>{item.name} x{item.quantity}</span><span>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span></div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span>Total: Rp {o.totalAmount?.toLocaleString('id-ID')}</span>
                  <div className="space-x-2">
                    <button onClick={() => handleUpdateStatus(o.id, 'Diproses', o.trackingNumber)} className="bg-amber-600 px-3 py-1.5 rounded-lg cursor-pointer">Diproses</button>
                    <button onClick={() => handleUpdateStatus(o.id, 'Dikirim', o.trackingNumber)} className="bg-blue-600 px-3 py-1.5 rounded-lg cursor-pointer">Dikirim</button>
                    <button onClick={() => handleUpdateStatus(o.id, 'Selesai', o.trackingNumber)} className="bg-emerald-600 px-3 py-1.5 rounded-lg cursor-pointer">Selesai</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <form onSubmit={handleAddProduct} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-3 h-fit">
              <h3 className="text-sm font-bold text-white"><Plus className="w-4 h-4 inline text-orange-400 mr-1" /> Tambah Produk</h3>
              <input type="text" placeholder="Nama Produk" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white">
                <option value="Tenda">Tenda</option><option value="Meja">Meja</option><option value="Kompor">Kompor</option><option value="Lampu">Lampu</option>
              </select>
              <input type="number" placeholder="Harga" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              <div>
                <label className="block text-slate-400 mb-1">Foto Produk</label>
                <label className="flex items-center justify-center space-x-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-300 cursor-pointer">
                  <Upload className="w-4 h-4 text-orange-400" />
                  <span>{form.image ? 'Ganti Foto' : 'Pilih File'}</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                {imagePreview && <div className="mt-2 w-full h-20 rounded-xl overflow-hidden"><img src={imagePreview} className="w-full h-full object-cover" /></div>}
              </div>
              <button type="submit" className="w-full bg-orange-500 font-bold py-2.5 rounded-xl cursor-pointer">Simpan Produk</button>
            </form>

            <div className="md:col-span-2 space-y-2">
              {products.map(p => (
                <div key={p.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                      {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-slate-600" />}
                    </div>
                    <div>
                      <span className="text-[10px] bg-slate-700 text-orange-400 px-2 py-0.5 rounded font-bold">{p.category}</span>
                      <h4 className="font-bold text-white mt-1">{p.name}</h4>
                      <span className="font-mono text-slate-400">Rp {Number(p.price)?.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteProduct(p.id)} className="bg-red-500/20 text-red-400 p-2.5 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return <Suspense fallback={<div className="min-h-screen bg-slate-900" />}><AdminContent /></Suspense>;
}