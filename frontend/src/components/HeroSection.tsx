'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-100 relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Sisi Kiri: Teks & Aksi */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-orange-500/10 text-orange-600 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ekspedisi Musim Hujan 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Petualangan Nyaman Dimulai dari Perlengkapan Presisi.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
            Dirancang khusus untuk ekosistem pegunungan Indonesia. Bobot ultralight, ketahanan air total 3000mm, dan kemudahan merakit di medan terjal.
          </p>

          {/* Tombol Aksi (Tombol Promo Spesial sudah dihapus, hanya menyisakan Jelajahi Katalog) */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="#katalog"
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-2xl font-bold text-sm transition shadow-lg cursor-pointer"
            >
              <span>Jelajahi Katalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Statistik Singkat */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100">
            <div>
              <div className="font-black text-slate-900 text-base sm:text-lg">100%</div>
              <div className="text-[11px] text-slate-500 font-medium">Original Expedition</div>
            </div>
            <div>
              <div className="font-black text-slate-900 text-base sm:text-lg">3 Tahun</div>
              <div className="text-[11px] text-slate-500 font-medium">Garansi Lapangan</div>
            </div>
            <div>
              <div className="font-black text-slate-900 text-base sm:text-lg">0 kg</div>
              <div className="text-[11px] text-slate-500 font-medium">Beban Ongkir (Jawa-Bali)</div>
            </div>
          </div>
        </div>

        {/* Sisi Kanan: Banner / Foto Produk Unggulan */}
        <div className="lg:col-span-5">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-4 shadow-sm">
            <div className="aspect-video w-full rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
              <span className="text-slate-400 font-medium text-xs tracking-wide">
                [ Banner Foto Utama ]
              </span>
            </div>

            <div className="flex items-center justify-between px-1">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Featured Product</span>
                <span className="font-bold text-slate-900 text-sm">Terra Peak Tent 4P – WP</span>
              </div>
              <span className="font-mono font-black text-orange-600 text-sm">
                Rp 1.850.000
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}