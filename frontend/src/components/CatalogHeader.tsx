'use client';

import React from 'react';

export default function CatalogHeader({
  selectedCategory,
  setSelectedCategory,
}: {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}) {
  const categories = ['Semua', 'Tenda', 'Meja', 'Kompor', 'Lampu'];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1C2541]/40 p-4 rounded-2xl border border-slate-800">
      <div>
        <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Katalog Lengkap</span>
        <h2 className="text-lg font-bold text-white">Pilihan Perlengkapan Siap Jelajah</h2>
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-[#0B132B] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}