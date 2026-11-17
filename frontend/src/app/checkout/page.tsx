'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { fetchApi } from '@/utils/api';

export default function CheckoutPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  const [searchLocation, setSearchLocation] = useState('');
  const [locationResults, setLocationResults] = useState<any[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);

  const [courier, setCourier] = useState('jne');
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [loadingOngkir, setLoadingOngkir] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(savedCart);
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchLocation.trim().length >= 3) {
        try {
          const res = await fetchApi(`/api/locations?q=${encodeURIComponent(searchLocation)}`);
          const data = await res.json();
          setLocationResults(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error('Gagal memuat lokasi:', err);
        }
      } else {
        setLocationResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchLocation]);

  if (!isMounted) {
    return <main className="min-h-screen bg-[#0b132b]" />;
  }

  const totalWeightGram = cartItems.reduce((acc, item) => acc + (Number(item.weight || 1000) * Number(item.quantity)), 0);
  const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0);
  const total = subtotal + shippingCost;

  const handleCheckOngkir = async (destId: string, selectedCourier: string) => {
    if (!destId) return;
    setLoadingOngkir(true);
    try {
      const res = await fetchApi('/api/check-ongkir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationId: destId,
          weightGram: totalWeightGram,
          courier: selectedCourier
        })
      });
      const options = await res.json();
      if (res.ok && Array.isArray(options)) {
        setShippingOptions(options);
        if (options.length > 0) {
          setSelectedService(options[0]);
          setShippingCost(options[0].price);
        }
      } else {
        setShippingOptions([]);
        setShippingCost(0);
      }
    } catch (err) {
      console.error('Gagal hitung ongkir:', err);
    } finally {
      setLoadingOngkir(false);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert('Keranjang belanja kosong!');
      return;
    }
    if (!selectedDestination || shippingCost <= 0) {
      alert('Pilih lokasi tujuan dan pastikan ongkos kirim sudah terhitung!');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        customerName: name,
        customerPhone: phone,
        shippingAddress: `${address}, ${selectedDestination.name || selectedDestination.label}`,
        destinationId: selectedDestination.id,
        courier: courier,
        serviceType: selectedService?.service,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: Number(item.quantity),
          variant: item.variant || 'Standard'
        }))
      };

      const res = await fetchApi('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const responseData = await res.json();

      if (res.ok) {
        const orderData = {
          orderCode: responseData.orderCode || 'MO-UNKNOWN',
          total,
          name,
          address: `${address}, ${selectedDestination.name || selectedDestination.label}`,
          courier: courier.toUpperCase(),
          service: selectedService?.service || 'Reguler'
        };

        localStorage.removeItem('cart');
        setCartItems([]);
        setConfirmedOrder(orderData);
      } else {
        alert(`Gagal membuat pesanan: ${responseData.error || 'Terjadi kesalahan di server.'}`);
      }
    } catch (error) {
      console.error('Error checkout:', error);
      alert('Terjadi kesalahan jaringan ke backend server.');
    } finally {
      setLoading(false);
    }
  };

  if (confirmedOrder) {
    const adminPhone = '6281225530033';
    const waMessage = `Halo Admin Mendadak Outdoor, saya ingin konfirmasi pembayaran untuk pesanan Kode: *${confirmedOrder.orderCode}*.\n\nTotal Transfer: *Rp ${confirmedOrder.total.toLocaleString('id-ID')}*\nNama: ${confirmedOrder.name}\nKurir: ${confirmedOrder.courier} (${confirmedOrder.service})\n\n[Bukti transfer dilampirkan]`;

    return (
      <main className="min-h-screen bg-[#0b132b] text-slate-100 flex flex-col justify-between">
        <div>
          <Navbar />
          <div className="max-w-2xl mx-auto px-6 py-12">
            <div className="bg-[#1e293b] p-8 rounded-3xl border border-gray-800 shadow-lg text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                ✓
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-black text-white">Pesanan Berhasil Dibuat!</h1>
                <p className="text-xs text-slate-400">Simpan kode pesanan Anda untuk melacak pengiriman secara real-time.</p>
              </div>

              <div className="bg-[#0f172a] p-4 rounded-2xl border border-gray-800 text-left space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Kode Pesanan:</span>
                  <span className="font-mono font-bold text-orange-400 text-sm">{confirmedOrder.orderCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Pembayaran:</span>
                  <span className="font-bold text-white">Rp {confirmedOrder.total.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Poin 16: Rekening BCA Asli Toko */}
              <div className="bg-orange-950/30 p-4 rounded-2xl border border-orange-900/50 text-left space-y-2 text-xs">
                <p className="font-bold text-orange-400">Silakan Transfer Pembayaran ke Rekening Resmi:</p>
                <p className="text-white font-mono text-sm">BCA: <strong>8830912345</strong> (a.n. PT Mendadak Outdoor Indonesia)</p>
                <p className="text-slate-400 text-[11px]">Kirimkan bukti transfer beserta kode pesanan melalui WhatsApp admin di bawah.</p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href={`https://wa.me/${adminPhone}?text=${encodeURIComponent(waMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Konfirmasi via WhatsApp 🚀</span>
                </a>
                <Link
                  href="/"
                  className="bg-gray-800 hover:bg-gray-700 text-slate-300 font-bold py-3 px-6 rounded-xl text-xs transition flex items-center justify-center"
                >
                  Kembali ke Beranda
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b132b] text-slate-100 flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">⚡ Checkout Pesanan</h1>
            <p className="text-xs text-gray-400">Selesaikan pengiriman dan konfirmasi pesanan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-[#1e293b] p-6 rounded-2xl border border-gray-800 shadow-md">
              <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Informasi Pengiriman</h2>
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required
                    placeholder="Masukkan nama penerima..."
                    className="w-full bg-[#0f172a] text-white text-xs px-4 py-2.5 rounded-xl border border-gray-700 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Nomor WhatsApp (Aktif)</label>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    required
                    placeholder="Contoh: 081234567890"
                    className="w-full bg-[#0f172a] text-white text-xs px-4 py-2.5 rounded-xl border border-gray-700 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="relative">
                  <label className="block text-xs font-medium text-gray-300 mb-1">Cari Kecamatan / Kota Tujuan</label>
                  <input 
                    type="text"
                    value={searchLocation}
                    onChange={(e) => {
                      setSearchLocation(e.target.value);
                      setSelectedDestination(null);
                      setShippingCost(0);
                    }}
                    placeholder="Ketik minimal 3 huruf..."
                    className="w-full bg-[#0f172a] text-white text-xs px-4 py-2.5 rounded-xl border border-gray-700 focus:outline-none focus:border-orange-500"
                  />
                  {selectedDestination && (
                    <p className="text-[11px] text-emerald-400 mt-1">Terpilih: {selectedDestination.name || selectedDestination.label}</p>
                  )}

                  {locationResults.length > 0 && !selectedDestination && (
                    <div className="absolute z-10 w-full bg-[#0f172a] border border-gray-700 mt-1 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {locationResults.map((loc, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedDestination(loc);
                            setSearchLocation(loc.name || loc.label);
                            setLocationResults([]);
                            handleCheckOngkir(loc.id, courier);
                          }}
                          className="px-4 py-2.5 text-xs text-slate-200 hover:bg-orange-600 hover:text-white cursor-pointer border-b border-gray-800/50"
                        >
                          {loc.name || loc.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Alamat Detail (Jalan, Nomor Rumah, RT/RW)</label>
                  <textarea 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    required
                    rows={2}
                    placeholder="Patokan rumah, nama jalan..."
                    className="w-full bg-[#0f172a] text-white text-xs px-4 py-2.5 rounded-xl border border-gray-700 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Pilih Kurir Ekspedisi</label>
                  <select 
                    value={courier} 
                    onChange={(e) => {
                      const newCourier = e.target.value;
                      setCourier(newCourier);
                      if (selectedDestination) {
                        handleCheckOngkir(selectedDestination.id, newCourier);
                      }
                    }}
                    className="w-full bg-[#0f172a] text-white text-xs px-4 py-2.5 rounded-xl border border-gray-700 focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="jne">JNE</option>
                    <option value="jnt">J&T Express</option>
                    <option value="sicepat">SiCepat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Pilih Layanan & Ongkir</label>
                  {loadingOngkir ? (
                    <div className="text-xs text-slate-400 py-2">Menghitung ongkir real-time...</div>
                  ) : shippingOptions.length > 0 ? (
                    <select
                      onChange={(e) => {
                        const opt = shippingOptions[Number(e.target.value)];
                        setSelectedService(opt);
                        setShippingCost(opt.price);
                      }}
                      className="w-full bg-[#0f172a] text-white text-xs px-4 py-2.5 rounded-xl border border-gray-700 focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                      {shippingOptions.map((opt, idx) => (
                        <option key={idx} value={idx}>
                          {opt.courier} - {opt.service} (Rp {opt.price.toLocaleString('id-ID')}) [{opt.estimated} Hari]
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-xs text-amber-400/80 bg-amber-950/30 p-3 rounded-xl border border-amber-900/50">
                      Pilih lokasi tujuan di atas untuk melihat pilihan ongkir otomatis.
                    </div>
                  )}
                </div>

                {/* Poin 11: Tombol Buat Pesanan dikunci jika ongkir belum valid / 0 */}
                <button 
                  type="submit" 
                  disabled={loading || !selectedDestination || shippingCost <= 0}
                  className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs transition shadow cursor-pointer mt-4"
                >
                  {loading ? 'Memproses Pesanan...' : shippingCost <= 0 ? 'Pilih Lokasi & Hitung Ongkir Dulu ⚠️' : 'Buat Pesanan Sekarang 🚀'}
                </button>
              </form>
            </div>

            <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-800 shadow-md h-fit space-y-4">
              <h2 className="text-sm font-bold text-white border-b border-gray-800 pb-3 uppercase tracking-wider">Ringkasan Belanja</h2>
              
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white line-clamp-1">{item.name}</span>
                      <span className="text-gray-400">({item.quantity}x)</span>
                    </div>
                    <span className="text-orange-400 font-semibold">Rp {(Number(item.price) * item.quantity).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-800 pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-gray-300">
                  <span>Total Berat</span>
                  <span>{(totalWeightGram / 1000).toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal Produk</span>
                  <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Ongkos Kirim</span>
                  <span>Rp {shippingCost.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-white font-extrabold text-sm border-t border-gray-800 pt-3">
                  <span>Total Pembayaran</span>
                  <span className="text-orange-400">Rp {total.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}