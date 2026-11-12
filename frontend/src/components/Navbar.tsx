'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Heart, ShoppingBag, User, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

function NavbarContent({
  selectedCategory: propsCategory,
  onSelectCategory,
}: {
  selectedCategory?: string;
  onSelectCategory?: (cat: string) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart } = useCart();
  const { wishlist } = useWishlist();

  const urlCategory = searchParams.get('category') || 'Semua';
  const currentCategory = propsCategory || urlCategory;

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const totalCartItems = cart ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const categories = ['Semua', 'Tenda', 'Meja', 'Kompor', 'Lampu'];

  const handleCategoryClick = (cat: string) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
    if (cat === 'Semua') {
      router.push('/');
    } else {
      router.push(`/?category=${encodeURIComponent(cat)}`);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0B132B] border-b border-slate-800/80 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4 sm:gap-8">
        
        {/* LOGO TOKO */}
        <Link href="/" className="shrink-0 flex items-center">
          <div className="relative h-11 w-36 sm:w-40 bg-white rounded-xl p-1.5 flex items-center justify-center shadow-sm hover:opacity-95 transition-opacity">
            <Image
              src="/logo.jpeg" 
              alt="Mendadak Outdoor Logo"
              width={140}
              height={40}
              className="object-contain h-full w-full"
              priority
            />
          </div>
        </Link>

        {/* SEARCH BAR */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl hidden md:block">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari peralatan outdoor, tenda, kompor..."
              className="w-full bg-[#1C2541]/70 border border-slate-700/60 focus:border-orange-500 text-slate-100 text-xs sm:text-sm rounded-full pl-5 pr-11 py-2.5 focus:outline-none transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Cari"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* IKON KANAN */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          
          {/* Tombol Lacak Pesanan */}
          <Link
            href="/tracking"
            className="flex items-center space-x-1.5 bg-[#1C2541]/70 hover:bg-[#1C2541] text-slate-200 text-xs font-semibold px-3.5 py-2.5 rounded-full border border-slate-700/50 transition-all cursor-pointer"
            title="Cek Pesanan"
          >
            <Truck className="w-4 h-4 text-orange-400" />
            <span className="hidden sm:inline">Cek Pesanan</span>
          </Link>

          <Link
            href="/wishlist"
            className="relative p-2.5 rounded-full bg-[#1C2541]/70 hover:bg-[#1C2541] text-slate-200 border border-slate-700/50 transition-all"
            title="Wishlist"
          >
            <Heart className="w-4 h-4" />
            {wishlist && wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </Link>

          <Link
            href="/cart"
            className="flex items-center space-x-2 bg-[#1C2541]/70 hover:bg-[#1C2541] text-white text-xs font-bold px-4 py-2.5 rounded-full border border-slate-700/50 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Keranjang</span>
            {totalCartItems > 0 && (
              <span className="bg-orange-500 text-white px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                {totalCartItems}
              </span>
            )}
          </Link>

          <Link
            href="/admin"
            className="p-2.5 rounded-full bg-[#1C2541]/70 hover:bg-[#1C2541] text-slate-200 border border-slate-700/50 transition-all"
            title="Admin Dashboard"
          >
            <User className="w-4 h-4" />
          </Link>
        </div>

      </div>

      {/* MENU KATEGORI BAWAH */}
      <div className="border-t border-slate-800/60 bg-[#0B132B]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const isActive = currentCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-[#1C2541]/50 text-slate-300 hover:bg-[#1C2541] hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}

// Export utama dibungkus Suspense agar tidak memicu prerender blocking error di Next.js
export default function Navbar(props: any) {
  return (
    <Suspense fallback={<div className="h-20 bg-[#0B132B]" />}>
      <NavbarContent {...props} />
    </Suspense>
  );
}