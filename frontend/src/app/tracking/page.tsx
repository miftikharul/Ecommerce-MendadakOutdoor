'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Clock, ArrowLeft, Search } from 'lucide-react';
import { fetchApi } from '@/utils/api';

const normalizePhoneInput = (raw: string) => {
  let cleaned = raw.replace(/[\s\-()]/g, '').trim();
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  }
  if (cleaned.startsWith('08')) {
    cleaned = '62' + cleaned.slice(1);
  }
  return cleaned;
};

export default function TrackingPage() {
  const [orderCode, setOrderCode] = useState('');
  const [phone, setPhone] = useState('');
  const [searchType, setSearchType] = useState<'live' | 'local'>('local');
  const [selectedCourier, setSelectedCourier] = useState('jne');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [localOrder, setLocalOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const courierList = [
    { id: 'jne', name: 'JNE Express' },
    { id: 'jnt', name: 'J&T Express' },
    { id: 'sentral', name: 'Sentral Cargo' },
    { id: 'jnt_cargo', name: 'J&T Cargo' },
  ];

  const handleTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setTrackingData(null);
    setLocalOrder(null);

    try {
      if (searchType === 'live') {
        if (!orderCode.trim()) {
          setErrorMessage('Masukkan nomor resi (AWB) terlebih dahulu.');
          setLoading(false);
          return;
        }
        const res = await fetchApi(`/api/track-resi?courier=${selectedCourier}&awb=${encodeURIComponent(orderCode.trim())}`);
        const result = await res.json();

        if (res.ok) {
          setTrackingData(result);
        } else {
          setErrorMessage(result.message || 'Resi tidak ditemukan atau ekspedisi tidak sesuai.');
        }
      } else {
        const normalizedPhone = normalizePhoneInput(phone);
        // Wajib dua input untuk lacak lokal
        if (!orderCode.trim() || !normalizedPhone) {
          setErrorMessage('Kode Pesanan dan Nomor WhatsApp wajib diisi lengkap.');
          setLoading(false);
          return;
        }

        const res = await fetchApi(
          `/api/orders/track-local?query=${encodeURIComponent(orderCode.trim())}&phone=${encodeURIComponent(normalizedPhone)}`
        );
        const result = await res.json();

        if (res.ok) {
          // Menangani data array dari backend (mengambil item pertama jika ada)
          if (result && result.length > 0) {
            setLocalOrder(result[0]);
          } else {
            setErrorMessage('Pesanan tidak ditemukan atau kombinasi kode & nomor WA salah.');
          }
        } else {
          setErrorMessage(result.error || 'Pesanan tidak ditemukan atau kombinasi data salah.');
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Terjadi kesalahan koneksi ke backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0b132b] text-slate-100 flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <Link href="/" className="hover:text-orange-400 transition">Katalog</Link>
            <span>/</span>
            <span className="font-bold text-slate-200">Lacak Status Pesanan</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-white">Lacak Pengiriman & Pesanan</h1>
              <p className="text-xs text-slate-400 mt-0.5">Cek status pesanan lokal atau lacak resi (AWB) ekspedisi real-time.</p>
            </div>
            <Link href="/" className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-orange-400 transition shrink-0">
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali Belanja</span>
            </Link>
          </div>

          <div className="bg-[#1e293b] p-6 rounded-3xl border border-gray-800 shadow-sm space-y-4">
            <div className="flex gap-2 border-b border-gray-800 pb-3">
              <button
                type="button"
                onClick={() => { setSearchType('local'); setOrderCode(''); setPhone(''); setErrorMessage(''); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  searchType === 'local' ? 'bg-orange-600 text-white' : 'bg-[#0f172a] text-slate-400 hover:text-white'
                }`}
              >
                Cari Pesanan Lokal (Kode + No. WA)
              </button>
              <button
                type="button"
                onClick={() => { setSearchType('live'); setOrderCode(''); setPhone(''); setErrorMessage(''); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  searchType === 'live' ? 'bg-orange-600 text-white' : 'bg-[#0f172a] text-slate-400 hover:text-white'
                }`}
              >
                Lacak Resi Kurir (AWB Live)
              </button>
            </div>

            <form onSubmit={handleTracking} className="space-y-4">
              {searchType === 'live' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Pilih Ekspedisi</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {courierList.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCourier(c.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          selectedCourier === c.id
                            ? 'bg-orange-600 text-white border-orange-500 shadow-sm'
                            : 'bg-[#0f172a] text-slate-300 border-gray-700 hover:bg-gray-800'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {searchType === 'local' ? (
                /* Dua Kolom Input Terpisah untuk Lacak Lokal */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">Kode Pesanan</label>
                    <input
                      type="text"
                      placeholder="Contoh: MO-260330-0001"
                      value={orderCode}
                      onChange={(e) => setOrderCode(e.target.value)}
                      className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-white placeholder-slate-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">Nomor WhatsApp</label>
                    <input
                      type="text"
                      placeholder="Contoh: 08123456789"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-white placeholder-slate-500"
                    />
                  </div>
                </div>
              ) : (
                /* Satu Input untuk Live AWB */
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Nomor Resi (AWB)</label>
                  <input
                    type="text"
                    placeholder="Masukkan nomor AWB kurir..."
                    value={orderCode}
                    onChange={(e) => setOrderCode(e.target.value)}
                    className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-white placeholder-slate-500"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white py-3 rounded-xl text-xs font-bold hover:bg-orange-500 transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-md"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? 'Mencari...' : 'Cari Data Pesanan'}</span>
              </button>
            </form>
          </div>

          {errorMessage && (
            <div className="bg-red-950/50 border border-red-800 text-red-300 p-4 rounded-2xl text-xs font-medium text-center">
              {errorMessage}
            </div>
          )}

          {localOrder && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Hasil Pencarian Pesanan</h3>
              <div className="bg-[#1e293b] rounded-3xl border border-gray-800 p-6 space-y-4 shadow-sm">
                <div className="flex justify-between items-center pb-3 border-b border-gray-800 text-xs">
                  <div>
                    <span className="text-orange-400 font-mono font-bold text-sm">{localOrder.orderCode}</span>
                    <p className="text-slate-400 text-[11px]">Dibuat: {new Date(localOrder.createdAt).toLocaleString('id-ID')}</p>
                  </div>
                  <span className="px-3 py-1 bg-orange-950 text-orange-400 border border-orange-900 rounded-xl font-bold uppercase">
                    Status: {localOrder.status}
                  </span>
                </div>

                <div className="bg-[#0f172a] p-4 rounded-2xl text-xs space-y-2">
                  <p className="text-slate-400">No. Resi Kurir (AWB): <strong className="text-emerald-400 font-mono">{localOrder.trackingNumber || 'Belum diinput admin'}</strong></p>
                  <p className="text-slate-400">Total Tagihan: <strong className="text-orange-400 font-mono">Rp {localOrder.totalPrice?.toLocaleString('id-ID')}</strong></p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white mb-2">Item Belanja:</h4>
                  <div className="space-y-2">
                    {localOrder.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-xs bg-[#0f172a]/60 px-3 py-2 rounded-xl border border-gray-800">
                        <span className="text-slate-200">{item.productName} <span className="text-slate-400">({item.variant})</span> x{item.quantity}</span>
                        <span className="font-mono text-orange-400">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {trackingData && (
            <div className="bg-[#1e293b] rounded-3xl border border-gray-800 p-6 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-800 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold bg-orange-950 text-orange-400 px-2.5 py-1 rounded-lg uppercase border border-orange-900/50">
                      {trackingData.summary?.courier}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-200">
                      AWB: {trackingData.summary?.waybill}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 bg-emerald-950/50 border border-emerald-800 text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Status: {trackingData.summary?.status}</span>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Riwayat Perjalanan Kurir</h4>
                <div className="border-l-2 border-emerald-500 ml-3 pl-6 space-y-6 text-xs relative">
                  {trackingData.history?.map((item: any, idx: number) => (
                    <div key={idx} className="relative">
                      <span className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-4 border-[#1e293b] ${idx === 0 ? 'bg-emerald-500 shadow-sm' : 'bg-slate-600'}`} />
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded text-slate-400 bg-[#0f172a]">
                          {item.date}
                        </span>
                        <p className={`font-semibold mt-1 ${idx === 0 ? 'text-white font-bold' : 'text-slate-300'}`}>{item.desc}</p>
                        {item.location && <p className="text-[10px] text-slate-400">Lokasi: {item.location}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}