'use client';

import React from 'react';

interface CategorySectionProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

export default function CategorySection({ selectedCategory, setSelectedCategory }: CategorySectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <span className="text-[11px] font-extrabold text-orange-400 uppercase tracking-wider">
            Pilihan Berdasarkan Kebutuhan
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
            Kategori Perlengkapan Teruji
          </h2>
        </div>
        <p className="text-xs text-slate-400 max-w-sm">
          Setiap instrumen dikaji dengan standar durabilitas ekspedisi pegunungan tinggi.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { name: 'Tenda', desc: 'Dome & Ultralight', count: '4 Produk' },
          { name: 'Meja', desc: 'Aluminium Roll Top', count: '2 Produk' },
          { name: 'Kompor', desc: 'Windproof Stove', count: '2 Produk' },
          { name: 'Lampu', desc: 'Lantern & Recharge', count: '2 Produk' },
        ].map((cat: any) => (
          <button
            key={cat.name}
            type="button"
            onClick={() => setSelectedCategory(cat.name)}
            className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
              selectedCategory === cat.name
                ? 'bg-orange-500/10 border-orange-500 text-white shadow-lg shadow-orange-500/10'
                : 'bg-[#1C2541]/50 border-slate-800 text-slate-300 hover:bg-[#1C2541] hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] font-bold text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded w-fit mb-2">
              {cat.count}
            </div>
            <h3 className="font-bold text-sm text-white">{cat.name}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{cat.desc}</p>
          </button>
        ))}
      </div>
    </section>
  );
}