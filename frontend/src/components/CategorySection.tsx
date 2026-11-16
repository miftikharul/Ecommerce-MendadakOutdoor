'use client';

import { useState } from 'react';
import ProductGrid from '@/components/ProductGrid';

export default function CatalogContainer({ initialProducts }: { initialProducts: any[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Hitung kategori & jumlah produk secara dinamis
  const categoryCounts: { [key: string]: number } = {};
  initialProducts.forEach((p: any) => {
    const cat = p.variant || p.category?.name || p.category || 'Standard';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const categories = Object.keys(categoryCounts);

  // Filter produk berdasarkan kategori & search query
  const filteredProducts = initialProducts.filter((p: any) => {
    const cat = p.variant || p.category?.name || p.category || 'Standard';
    const matchesCategory = selectedCategory === 'Semua' || cat === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-[#1C2541]/40 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="w-full md:w-1/3">
          <input 
            type="text" 
            placeholder="Cari peralatan outdoor, tenda, kompor..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B132B] text-white placeholder-slate-400 text-xs px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button 
            onClick={() => setSelectedCategory('Semua')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${selectedCategory === 'Semua' ? 'bg-orange-500 text-white shadow-md' : 'bg-[#0B132B] text-slate-400 hover:text-white border border-slate-800'}`}
          >
            Semua ({initialProducts.length})
          </button>
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${selectedCategory === cat ? 'bg-orange-500 text-white shadow-md' : 'bg-[#0B132B] text-slate-400 hover:text-white border border-slate-800'}`}
            >
              {cat} ({categoryCounts[cat]})
            </button>
          ))}
        </div>
      </div>

      {/* Info Jumlah Tampilan */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-xl font-black text-white">Katalog Peralatan Lapangan</h2>
          <p className="text-xs text-slate-400">Pilih perlengkapan terbaik untuk kenyamanan petualanganmu.</p>
        </div>
        <span className="text-xs font-bold text-slate-400">Menampilkan {filteredProducts.length} produk</span>
      </div>

      {/* Render ProductGrid yang sudah ada */}
      <ProductGrid products={filteredProducts} />
    </div>
  );
}