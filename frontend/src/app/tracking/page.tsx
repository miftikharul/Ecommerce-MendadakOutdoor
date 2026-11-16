'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Clock, ArrowLeft, MapPin, Search } from 'lucide-react';

export default function TrackingPage() {
  const [searchResi, setSearchResi] = useState('');
  const [selectedCourier, setSelectedCourier] = useState('jne');
  const [trackingData, setTrackingData] = useState<any>(null);
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
    if (!searchResi.trim()) return;

    setLoading(true);
    setErrorMessage('');
    setTrackingData(null);

    try {
      const res = await fetch(`http://localhost:5000/api/track-resi?courier=${selectedCourier}&waybill=${searchResi.trim()}`);
      const result = await res.json();

      if (result.status === 200) {
        setTrackingData(result.data);
      } else {
        setErrorMessage(result.message || 'Resi tidak ditemukan atau pilihan ekspedisi tidak sesuai.');
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
            <span className="font-bold text-slate-200">Lacak Pengiriman Live</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-white">Lacak Paket Multi-Ekspedisi</h1>
              <p className="text-xs text-slate-400 mt-0.5">Cek perjalanan paket JNE, J&T, Sentral Cargo, & J&T Cargo secara real-time.</p>
            </div>
            <Link href="/" className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-orange-400 transition shrink-0">
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali Belanja</span>
            </Link>
          </div>

          {/* Form Input Resi & Pilih Kurir */}
          <div className="bg-[#1e293b] p-6 rounded-3xl border border-gray-800 shadow-sm space-y-4">
            <form onSubmit={handleTracking} className="space-y-4">
              
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

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Nomor Resi Pengiriman</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Masukkan nomor resi kurir..."
                    value={searchResi}
                    onChange={(e) => setSearchResi(e.target.value)}
                    className="flex-1 bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-white placeholder-slate-500"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-orange-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-orange-500 transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-md"
                  >
                    <Search className="w-4 h-4" />
                    <span>{loading ? 'Melacak...' : 'Lacak Resi'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Pesan Error */}
          {errorMessage && (
            <div className="bg-red-950/50 border border-red-800 text-red-300 p-4 rounded-2xl text-xs font-medium text-center">
              {errorMessage}
            </div>
          )}

          {/* Tampilan Hasil Tracking Live */}
          {trackingData && (
            <div className="bg-[#1e293b] rounded-3xl border border-gray-800 p-6 space-y-6 shadow-sm">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-800 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold bg-orange-950 text-orange-400 px-2.5 py-1 rounded-lg uppercase border border-orange-900/50">
                      {trackingData.summary?.courier}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-200">
                      Resi: {trackingData.summary?.waybill}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Layanan: <span className="font-semibold text-slate-200">{trackingData.summary?.service || 'Reguler'}</span></p>
                </div>

                <div className="flex items-center space-x-2 bg-emerald-950/50 border border-emerald-800 text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Status: {trackingData.summary?.status}</span>
                </div>
              </div>

              <div className="bg-[#0f172a] p-4 rounded-2xl space-y-1 text-xs border border-gray-800">
                <div className="font-bold text-white flex justify-between">
                  <span>Penerima: {trackingData.detail?.receiver || '-'}</span>
                  <span className="text-slate-400 font-normal">Pengirim: {trackingData.detail?.shipper || '-'}</span>
                </div>
                <p className="text-slate-300 flex items-start gap-1 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>Tujuan: {trackingData.detail?.destination || '-'}</span>
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Riwayat Perjalanan (Live API)</h4>
                <div className="border-l-2 border-emerald-500 ml-3 pl-6 space-y-6 text-xs relative">
                  {trackingData.history?.map((item: any, idx: number) => (
                    <div key={idx} className="relative">
                      <span className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-4 border-[#1e293b] ${idx === 0 ? 'bg-emerald-500 shadow-sm' : 'bg-slate-600'}`} />
                      <div className="space-y-0.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${idx === 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'text-slate-400 bg-[#0f172a]'}`}>
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