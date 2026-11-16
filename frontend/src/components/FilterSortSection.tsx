'use client';

import React from 'react';

interface FilterSortProps {
  priceRange: string;
  setPriceRange: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  setCurrentPage: (page: number) => void;
}

export default function FilterSortSection({
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  setCurrentPage,
}: FilterSortProps) {
  return (
    <div className="max-w-7xl mx-auto px-6 mt-6">
      <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-1/2 flex items-center gap-2">
          <span className="text-xs font-bold text-gray-300 whitespace-nowrap">Rentang Harga:</span>
          <select
            value={priceRange}
            onChange={(e) => {
              setPriceRange(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#0f172a] border border-gray-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="semua">Semua Harga</option>
            <option value="dibawah-100k">Di bawah Rp 100.000</option>
            <option value="100k-500k">Rp 100.000 - Rp 500.000</option>
            <option value="diatas-500k">Di atas Rp 500.000</option>
          </select>
        </div>

        <div className="w-full md:w-1/2 flex items-center gap-2">
          <span className="text-xs font-bold text-gray-300 whitespace-nowrap">Urutkan:</span>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#0f172a] border border-gray-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="terbaru">Terbaru</option>
            <option value="termurah">Harga Termurah</option>
            <option value="termahal">Harga Termahal</option>
          </select>
        </div>
      </div>
    </div>
  );
}