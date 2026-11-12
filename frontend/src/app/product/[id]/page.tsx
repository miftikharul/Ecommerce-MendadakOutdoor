'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import Link from 'next/link';
import { Star, ShoppingBag, Heart, ArrowLeft, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

function ProductDetailContent() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('Standard');

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  useEffect(() => {
    if (!productId) return;

    fetch(`http://localhost:5000/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProduct(data.data);
          if (data.data.variants && data.data.variants.length > 0) {
            setSelectedVariant(data.data.variants[0]);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Gagal mengambil detail produk:', err);
        setLoading(false);
      });
  }, [productId]);

  if (loading) {
    return (
      <div className="text-center py-20 text-xs text-slate-500 font-medium">
        Memuat detail produk...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-16 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Produk Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500">Produk yang kamu cari mungkin sudah dihapus atau tidak tersedia.</p>
        <Link href="/" className="inline-flex items-center space-x-2 bg-[#0b1329] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-orange-500 transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog</span>
        </Link>
      </div>
    );
  }

  const variants = product.variants || ['Army Green', 'Black Charcoal', 'Desert Tan'];

  return (
    <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
      {/* Breadcrumb */}
      <div className="text-xs text-slate-500 flex items-center space-x-2">
        <Link href="/" className="hover:text-orange-500 transition">Katalog</Link>
        <span>/</span>
        <span className="text-slate-600">{product.category}</span>
        <span>/</span>
        <span className="font-bold text-slate-900 line-clamp-1">{product.name}</span>
      </div>

      <button 
        onClick={() => router.back()} 
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-orange-500 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali</span>
      </button>

      {/* Main Product Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start bg-white p-8 rounded-3xl border border-gray-200 shadow-xs">
        
        {/* Gallery Image Placeholder */}
        <div className="space-y-4">
          <div className="bg-slate-100 rounded-2xl border border-gray-200 h-80 sm:h-96 flex items-center justify-center relative overflow-hidden">
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md absolute top-4 left-4 shadow-xs">
              {product.discount || 'PROMO OUTDOOR'}
            </span>
            <button 
              onClick={() => toggleWishlist(product)} 
              className="absolute top-4 right-4 w-9 h-9 bg-white/95 backdrop-blur rounded-full flex items-center justify-center shadow-xs hover:scale-105 transition cursor-pointer"
              title="Simpan ke Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted(product.id) ? 'text-red-500 fill-current' : 'text-slate-600 hover:text-red-500'}`} />
            </button>
            <div className="text-slate-400 text-xs font-medium">[ Foto Utama Produk ]</div>
          </div>
        </div>

        {/* Product Info & Action */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">{product.category}</span>
            <h1 className="text-xl font-black text-slate-900 mt-1 leading-snug">{product.name}</h1>
            
            <div className="flex items-center space-x-4 mt-2 text-xs">
              <div className="flex items-center text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-current mr-1" />
                <span>{product.rating || 4.9}</span>
              </div>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">Terjual <strong className="text-slate-800 font-semibold">120+ item</strong></span>
            </div>
          </div>

          {/* Price */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-baseline space-x-3">
            <span className="text-2xl font-black text-slate-900 font-mono">Rp {product.price?.toLocaleString('id-ID')}</span>
            {product.originalPrice && (
              <span className="text-xs text-slate-400 line-through font-mono">Rp {product.originalPrice?.toLocaleString('id-ID')}</span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2 text-xs text-slate-600 leading-relaxed border-t border-b border-gray-100 py-4">
            <h3 className="font-bold text-slate-900">Deskripsi Perlengkapan:</h3>
            <p>{product.description || 'Peralatan outdoor kualitas premium standar pendakian gunung & camping ultralight. Dirancang tangguh, tahan cuaca ekstrem, dan sangat praktis dibawa berpetualang.'}</p>
          </div>

          {/* Variant Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 block">Pilih Varian Warna / Tipe:</label>
            <div className="flex flex-wrap gap-2">
              {variants.map((v: string) => (
                <button
                  key={v}
                  onClick={() => setSelectedVariant(v)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border cursor-pointer ${
                    selectedVariant === v
                      ? 'bg-[#0b1329] text-white border-[#0b1329]'
                      : 'bg-white border-gray-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Add to Cart */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center space-x-4">
              <span className="text-xs font-bold text-slate-900">Jumlah:</span>
              <div className="flex items-center border border-gray-300 rounded-xl px-3 py-1.5 bg-white">
                <button 
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="px-2 font-bold text-slate-600 hover:text-orange-500 text-xs cursor-pointer"
                >
                  -
                </button>
                <span className="px-3 text-xs font-bold font-mono">{quantity}</span>
                <button 
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="px-2 font-bold text-slate-600 hover:text-orange-500 text-xs cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  addToCart(product, quantity, selectedVariant);
                  alert(`Berhasil menambahkan ${quantity}x ${product.name} (${selectedVariant}) ke keranjang!`);
                }}
                className="flex-1 bg-[#0b1329] text-white py-3.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 hover:bg-orange-500 transition shadow-md cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Tambah ke Keranjang</span>
              </button>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-2 pt-4 text-[11px] text-slate-500 text-center border-t border-gray-100">
            <div className="flex flex-col items-center space-y-1">
              <ShieldCheck className="w-4 h-4 text-orange-500" />
              <span>Garansi Resmi</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <Truck className="w-4 h-4 text-orange-500" />
              <span>Kirim Cepat</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <RotateCcw className="w-4 h-4 text-orange-500" />
              <span>100% Original</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <main className="min-h-screen bg-[#f8f7f4] text-slate-800 flex flex-col justify-between">
      <div>
        <Navbar />
        <Suspense fallback={<div className="text-center py-20 text-xs text-slate-500">Memuat produk...</div>}>
          <ProductDetailContent />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}