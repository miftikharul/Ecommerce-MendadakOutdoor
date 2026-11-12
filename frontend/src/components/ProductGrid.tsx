'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Star, ShoppingBag, Zap } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

export default function ProductGrid({
  products,
  loading = false,
}: {
  products: any[];
  loading?: boolean;
}) {
  const router = useRouter();
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Fungsi untuk Beli Langsung (tambah ke keranjang lalu langsung ke halaman cart)
  const handleBuyNow = (product: any) => {
    addToCart({ ...product, quantity: 1 });
    router.push('/cart');
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="bg-[#1C2541]/40 border border-slate-800 rounded-2xl p-4 h-72 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="bg-[#1C2541]/30 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2">
        <p className="font-bold text-base text-white">Belum ada produk yang ditemukan.</p>
        <p className="text-xs">Coba pilih kategori lain di atas.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
      {products.map((product) => {
        const isWishlisted = wishlist?.some((item: any) => item.id === product.id);

        return (
          <div
            key={product.id}
            className="group bg-[#1C2541]/60 hover:bg-[#1C2541] border border-slate-800 hover:border-orange-500/50 rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between shadow-lg"
          >
            <div className="space-y-3">
              {/* Box Foto Produk */}
              <div className="relative aspect-video w-full rounded-xl bg-[#0B132B] border border-slate-800 overflow-hidden flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-[#0B132B]/80 hover:bg-[#0B132B] text-slate-300 hover:text-red-400 transition-colors z-10 backdrop-blur-sm cursor-pointer"
                  title="Tambah ke Wishlist"
                >
                  <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                </button>

                {product.image && product.image.trim() !== '' ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-slate-500 font-medium text-xs tracking-wide">
                    [ Foto Produk ]
                  </span>
                )}
              </div>

              {/* Kategori & Rating */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[10px] font-extrabold text-orange-400 uppercase tracking-wider">
                  {product.category}
                </span>
                <div className="flex items-center space-x-1 text-amber-400 font-bold text-[11px]">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{product.rating || 5.0}</span>
                </div>
              </div>

              {/* Nama Produk */}
              <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-orange-400 transition-colors min-h-[36px]">
                {product.name}
              </h3>
            </div>

            {/* Bagian Harga & Tombol Aksi */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2 mt-3">
              <div className="font-mono font-black text-white text-sm sm:text-base">
                Rp {product.price?.toLocaleString('id-ID')}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Tombol + Keranjang */}
                <button
                  type="button"
                  onClick={() => addToCart({ ...product, quantity: 1 })}
                  className="flex items-center justify-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] py-2 rounded-xl transition-all border border-slate-700 cursor-pointer"
                  title="Masukkan ke Keranjang"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-orange-400" />
                  <span>Keranjang</span>
                </button>

                {/* Tombol Beli Langsung / Checkout Instan */}
                <button
                  type="button"
                  onClick={() => handleBuyNow(product)}
                  className="flex items-center justify-center space-x-1 bg-orange-500 hover:bg-orange-600 text-white font-bold text-[11px] py-2 rounded-xl transition-all shadow-md cursor-pointer"
                  title="Beli Langsung"
                >
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>Beli Cepat</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}