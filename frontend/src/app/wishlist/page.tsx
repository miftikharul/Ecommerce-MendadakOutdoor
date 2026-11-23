'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Heart, ShoppingBag, ArrowLeft } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper aman untuk mendeteksi gambar dari berbagai format object produk
  const getProductImage = (product: any) => {
    const img = product.image || (product.images && product.images[0]);
    if (!img) return '';
    return img.startsWith('http') ? img : `${API_URL}${img}`;
  };

  return (
    <main className="min-h-screen bg-[#0b132b] text-slate-100 flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
          {/* Breadcrumb */}
          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <Link href="/" className="hover:text-orange-400 transition">Katalog</Link>
            <span>/</span>
            <span className="font-bold text-slate-200">Wishlist & Produk Favorit</span>
          </div>

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-white">Daftar Wishlist Saya</h1>
            <Link href="/" className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-orange-400 transition">
              <ArrowLeft className="w-4 h-4" />
              <span>Lanjut Belanja</span>
            </Link>
          </div>

          {wishlist.length === 0 ? (
            /* Tampilan Wishlist Kosong */
            <div className="bg-[#1e293b] p-12 rounded-3xl border border-gray-800 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-[#0f172a] rounded-full flex items-center justify-center mx-auto text-slate-400 border border-gray-800">
                <Heart className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Belum Ada Produk di Wishlist</h3>
                <p className="text-xs text-slate-400">Klik ikon love pada produk favoritmu di katalog untuk menyimpannya di sini.</p>
              </div>
              <Link href="/" className="inline-flex items-center space-x-2 bg-orange-600 text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-orange-500 transition shadow-md">
                <ArrowLeft className="w-4 h-4" />
                <span>Eksplorasi Katalog Produk</span>
              </Link>
            </div>
          ) : (
            /* Grid Produk Wishlist */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {wishlist.map((product) => {
                const displayImg = getProductImage(product);
                return (
                  <div
                    key={product.id}
                    className="bg-[#1e293b] rounded-2xl border border-gray-800 overflow-hidden hover:shadow-lg transition flex flex-col justify-between group"
                  >
                    <div className="relative bg-[#0f172a] h-48 flex items-center justify-center p-4 border-b border-gray-800 overflow-hidden">
                      <button
                        onClick={() => toggleWishlist(product)}
                        className="absolute top-3 right-3 w-8 h-8 bg-[#1e293b]/95 backdrop-blur rounded-full flex items-center justify-center text-red-500 shadow-sm transition hover:scale-105 border border-gray-700 cursor-pointer z-10"
                        title="Hapus dari Wishlist"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>

                      {displayImg ? (
                        <img
                          src={displayImg}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-slate-500 text-xs font-medium">[ Tanpa Foto Produk ]</div>
                      )}
                    </div>

                    <div className="p-4 flex flex-col flex-1 justify-between space-y-4">
                      <div>
                        <span className="text-[11px] text-slate-400">{product.category?.name || product.category || 'Outdoor'}</span>
                        <Link href={`/product/${product.id}`}>
                          <h3 className="text-xs font-bold text-white group-hover:text-orange-400 transition line-clamp-2 leading-relaxed mt-1">
                            {product.name}
                          </h3>
                        </Link>
                      </div>

                      <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
                        <p className="text-sm font-black text-orange-400 font-mono">Rp {Number(product.price)?.toLocaleString('id-ID')}</p>

                        <button
                          onClick={() => {
                            addToCart({
                              id: product.id,
                              name: product.name,
                              price: Number(product.price),
                              weight: Number(product.weight || 1000),
                              image: displayImg,
                              quantity: 1,
                              variant: product.variant || 'Standard',
                            });
                            showToast(`Berhasil menambahkan ${product.name} ke keranjang!`);
                          }}
                          className="bg-orange-600 text-white px-3 py-2 rounded-xl text-xs font-medium flex items-center space-x-1 hover:bg-orange-500 transition shadow-sm cursor-pointer"
                          title="Pindahkan ke Keranjang"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>+ Keranjang</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </main>
  );
}