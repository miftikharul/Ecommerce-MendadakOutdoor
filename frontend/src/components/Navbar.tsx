'use client';

import Link from 'next/link';

export default function Navbar({ selectedCategory, onSelectCategory, searchQuery, onSearchChange }: any) {
  return (
    <header className="bg-[#0f172a] text-white py-4 px-6 shadow-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-white px-4 py-2 rounded-xl inline-block mb-3 shadow-md">
            <img src="logo.jpeg" alt="Mendadak Outdoor" className="h-9 w-auto object-contain" />
        </div>
        </Link>

        {/* Live Search Bar */}
        <div className="w-full md:w-1/3 relative">
          <input 
            type="text" 
            placeholder="Cari peralatan outdoor, tenda, kompor..." 
            value={searchQuery || ''}
            onChange={(e) => {
              if (onSearchChange) {
                onSearchChange(e.target.value);
              }
            }}
            className="w-full bg-[#1e293b] text-white placeholder-gray-400 text-sm px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-orange-500"
          />
          <span className="absolute right-3 top-2.5 text-gray-400">
            🔍
          </span>
        </div>

        {/* Menu Kanan (Termasuk Tombol Admin yang Dikembalikan) */}
        <div className="flex items-center gap-3">
          <Link href="/tracking" className="text-sm text-gray-300 hover:text-white px-3 py-1.5 transition">
            📦 Cek Pesanan
          </Link>
          <Link href="/wishlist" className="text-sm text-gray-300 hover:text-white px-3 py-1.5 transition flex items-center gap-1">
            ❤️ Wishlist
          </Link>
          <Link href="/cart" className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow transition flex items-center gap-1.5">
            🛒 Keranjang
          </Link>
          <Link href="/admin" className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-2 rounded-lg text-sm font-semibold border border-gray-700 transition">
            ⚙️ Admin
          </Link>
        </div>
      </div>
    </header>
  );
}