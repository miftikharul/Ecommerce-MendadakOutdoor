'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Trash2, ArrowLeft, ShieldCheck, Truck, X, MessageSquare, Calculator } from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, totalPrice, totalItems } = useCart();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '', city: '', notes: '' });
  const [selectedCourier, setSelectedCourier] = useState('jne');
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [loadingCost, setLoadingCost] = useState(false);

  const ADMIN_WHATSAPP = '6281225530033';
  const totalWeight = cart.reduce((acc, item) => acc + (item.weight || 1.0) * item.quantity, 0);

  // Handler Cek Ongkir Otomatis ke Backend Express
  const handleCalculateOngkir = async () => {
    if (!customerInfo.city.trim()) {
      alert('Masukkan kota tujuan pengiriman terlebih dahulu!');
      return;
    }
    setLoadingCost(true);
    try {
      const weightInGram = Math.ceil(totalWeight * 1000);
      const res = await fetch(`http://localhost:5000/api/check-ongkir?destination=${customerInfo.city}&weight=${weightInGram}&courier=${selectedCourier}`);
      const data = await res.json();
      
      if (data.status === 200 && data.data?.costs?.length > 0) {
        setShippingCost(data.data.costs[0].price || 15000);
      } else {
        setShippingCost(20000); // Estimasi fallback jika nama kota kurang spesifik
      }
    } catch (err) {
      console.error(err);
      setShippingCost(20000);
    } finally {
      setLoadingCost(false);
    }
  };

  const handleSendToWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address || !customerInfo.city) {
      alert('Harap isi Nama, No. WhatsApp, Alamat, dan Kota Tujuan!');
      return;
    }

    const finalOngkir = shippingCost || 0;
    const grandTotal = totalPrice + finalOngkir;

    const orderPayload = {
      customerName: customerInfo.name,
      phone: customerInfo.phone,
      address: `${customerInfo.address}, ${customerInfo.city}`,
      courier: selectedCourier.toUpperCase(),
      shippingCost: finalOngkir,
      items: cart,
      totalAmount: grandTotal,
      notes: customerInfo.notes || ''
    };

    try {
      await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
    } catch (err) { console.error('Gagal mencatat order:', err); }

    let message = `Halo Admin *MENDADAK OUTDOOR*, saya mau pesan peralatan berikut:\n\n`;
    message += `------------------------------------\n*DETAIL PESANAN*\n------------------------------------\n`;
    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.name}* (${item.variant || 'Standard'}) - ${item.quantity}x Rp ${item.price?.toLocaleString('id-ID')}\n`;
    });
    message += `------------------------------------\n`;
    message += `*SUBTOTAL BARANG:* Rp ${totalPrice.toLocaleString('id-ID')}\n`;
    message += `*EKSPEDISI:* ${selectedCourier.toUpperCase()}\n`;
    message += `*ONGKOS KIRIM:* Rp ${finalOngkir.toLocaleString('id-ID')}\n`;
    message += `*TOTAL TAGIHAN:* Rp ${grandTotal.toLocaleString('id-ID')}\n`;
    message += `------------------------------------\n\n`;
    message += `*DATA PEMESAN*\n- Nama: ${customerInfo.name}\n- No. WA: ${customerInfo.phone}\n- Alamat: ${customerInfo.address}, ${customerInfo.city}\n`;
    if (customerInfo.notes) message += `- Catatan: ${customerInfo.notes}\n`;

    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank');
    if (clearCart) clearCart();
    setIsModalOpen(false);
    router.push('/tracking');
  };

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-slate-800 flex flex-col justify-between">
      <div>
        <Navbar />
        <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-slate-900">Keranjang Peralatan Lapangan</h1>
            <Link href="/" className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-orange-500">
              <ArrowLeft className="w-4 h-4" /><span>Lanjut Belanja</span>
            </Link>
          </div>

          {cart.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Keranjang Belanjamu Masih Kosong</h3>
              <Link href="/" className="inline-flex items-center space-x-2 bg-[#0b1329] text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-orange-500">
                <ArrowLeft className="w-4 h-4" /><span>Eksplorasi Katalog Produk</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-3xl border p-6 space-y-4 shadow-xs">
                  <div className="flex justify-between items-center pb-4 border-b text-xs text-slate-500 font-medium">
                    <span>Item Perlengkapan ({totalItems})</span>
                    <span>Subtotal</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {cart.map((item) => (
                      <div key={`${item.id}-${item.variant}`} className="py-4 flex gap-4 items-center justify-between">
                        <div className="flex gap-4 items-center">
                          <div className="w-16 h-16 bg-slate-100 rounded-2xl border flex items-center justify-center overflow-hidden">
                            {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <span className="text-[10px] text-slate-400">Foto</span>}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                            <p className="text-[11px] text-slate-500">Varian: {item.variant || 'Standard'}</p>
                            <p className="text-xs font-bold font-mono text-orange-600">Rp {item.price?.toLocaleString('id-ID')}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center border rounded-xl px-2.5 py-1 bg-white">
                            <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="px-1.5 font-bold text-xs">-</button>
                            <span className="px-2.5 text-xs font-bold font-mono">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-1.5 font-bold text-xs">+</button>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black font-mono">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                            <button onClick={() => removeFromCart(item.id)} className="text-[11px] text-red-500 hover:text-red-700 flex items-center gap-1 mt-1 ml-auto">
                              <Trash2 className="w-3.5 h-3.5" /><span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-orange-50/50 border border-orange-200 rounded-2xl p-4 flex items-center space-x-3 text-xs text-orange-900">
                  <ShieldCheck className="w-5 h-5 text-orange-500 shrink-0" />
                  <span>Semua produk dilindungi <strong>Garansi Resmi Mendadak Outdoor</strong>.</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border space-y-5 shadow-xs sticky top-24">
                <h3 className="text-sm font-bold pb-3 border-b">Ringkasan Pesanan</h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-600"><span>Total Barang</span><span className="font-mono font-bold">Rp {totalPrice.toLocaleString('id-ID')}</span></div>
                  <div className="flex justify-between text-slate-600"><span>Estimasi Berat</span><span className="font-mono font-bold">{totalWeight.toFixed(1)} kg</span></div>
                </div>
                <div className="pt-3 border-t flex justify-between items-baseline">
                  <span className="text-xs font-bold">Total Belanja</span>
                  <span className="text-lg font-black font-mono text-orange-600">Rp {totalPrice.toLocaleString('id-ID')}</span>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="w-full bg-emerald-600 text-white py-3.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 hover:bg-emerald-700 shadow-md">
                  <MessageSquare className="w-4 h-4" /><span>Pesan via WhatsApp & Cek Ongkir</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="text-sm font-bold text-slate-900">Isi Data & Cek Ongkir Otomatis</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSendToWhatsApp} className="space-y-3 text-xs">
              <input type="text" required placeholder="Nama Lengkap *" value={customerInfo.name} onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })} className="w-full border p-2.5 rounded-xl" />
              <input type="tel" required placeholder="Nomor WhatsApp *" value={customerInfo.phone} onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })} className="w-full border p-2.5 rounded-xl" />
              <textarea required rows={2} placeholder="Alamat Lengkap (Jalan, RT/RW) *" value={customerInfo.address} onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })} className="w-full border p-2.5 rounded-xl" />
              
              <div className="flex gap-2">
                <input type="text" required placeholder="Kota Tujuan (cth: Bandung)" value={customerInfo.city} onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })} className="flex-1 border p-2.5 rounded-xl" />
                <button type="button" onClick={handleCalculateOngkir} className="bg-orange-500 text-white px-3.5 py-2.5 rounded-xl font-bold flex items-center space-x-1">
                  <Calculator className="w-3.5 h-3.5" /><span>{loadingCost ? '...' : 'Cek Ongkir'}</span>
                </button>
              </div>

              <div className="space-y-1">
                <label className="font-bold block text-slate-700">Pilih Ekspedisi</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['jne', 'jnt', 'sentral', 'jnt_cargo'].map((courier) => (
                    <button key={courier} type="button" onClick={() => { setSelectedCourier(courier); setShippingCost(null); }} className={`py-1.5 rounded-lg border uppercase text-[10px] font-bold ${selectedCourier === courier ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700'}`}>
                      {courier}
                    </button>
                  ))}
                </div>
              </div>

              {shippingCost !== null && (
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-emerald-800 font-bold flex justify-between">
                  <span>Ongkir ({selectedCourier.toUpperCase()}):</span>
                  <span>Rp {shippingCost.toLocaleString('id-ID')}</span>
                </div>
              )}

              <input type="text" placeholder="Catatan Tambahan (Opsional)" value={customerInfo.notes} onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })} className="w-full border p-2.5 rounded-xl" />

              <button type="submit" className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 flex items-center justify-center space-x-2">
                <MessageSquare className="w-4 h-4" /><span>Kirim Pesanan ke WA Admin</span>
              </button>
            </form>
          </div>
        </div>
      )}
      <Footer />
    </main>
  );
}