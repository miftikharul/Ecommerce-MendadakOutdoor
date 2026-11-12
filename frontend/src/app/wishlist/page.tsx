'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Heart, ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-slate-800 flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
          {/* Breadcrumb */}
          <div className="text-xs text-slate-500 flex items-center space-x-2">
            <Link href="/" className="hover:text-orange-500 transition">Katalog</Link>
            <span>/</span>
            <span className="font-bold text-slate-900">Wishlist & Produk Favorit</span>
          </div>

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-slate-900">Daftar Wishlist Saya</h1>
            <Link href="/" className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-orange-500 transition">
              <ArrowLeft className="w-4 h-4" />
              <span>Lanjut Belanja</span>
            </Link>
          </div>

          {wishlist.length === 0 ? (
            /* Tampilan Wishlist Kosong */
            <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Heart className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Belum Ada Produk di Wishlist</h3>
                <p className="text-xs text-slate-500">Klik ikon love pada produk favoritmu di katalog untuk menyimpannya di sini.</p>
              </div>
              <Link href="/" className="inline-flex items-center space-x-2 bg-[#0b1329] text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-orange-500 transition shadow-xs">
                <ArrowLeft className="w-4 h-4" />
                <span>Eksplorasi Katalog Produk</span>
              </Link>
            </div>
          ) : (
            /* Grid Produk Wishlist */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {wishlist.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition flex flex-col justify-between group"
                >
                  <div className="relative bg-slate-100 h-48 flex items-center justify-center p-4">
                    <button 
                      onClick={() => toggleWishlist(product)} 
                      className="absolute top-3 right-3 w-8 h-8 bg-white/95 backdrop-blur rounded-full flex items-center justify-center text-red-500 shadow-xs transition hover:scale-105"
                      title="Hapus dari Wishlist"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                    <div className="text-slate-400 text-xs font-medium">[ Foto Produk ]</div>
                  </div>

                  <div className="p-4 flex flex-col flex-1 justify-between space-y-4">
                    <div>
                      <span className="text-[11px] text-slate-500">{product.category}</span>
                      <Link href={`/product/${product.id}`}>
                        <h3 className="text-xs font-bold text-slate-900 group-hover:text-orange-600 transition line-clamp-2 leading-relaxed mt-1">
                          {product.name}
                        </h3>
                      </Link>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <p className="text-sm font-black text-slate-900 font-mono">Rp {product.price?.toLocaleString('id-ID')}</p>
                      
                      <button 
                        onClick={() => {
                          addToCart(product, 1);
                          alert(`Berhasil menambahkan ${product.name} ke keranjang!`);
                        }}
                        className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs font-medium flex items-center space-x-1 hover:bg-orange-500 transition shadow-xs cursor-pointer"
                        title="Pindahkan ke Keranjang"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>+ Keranjang</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}