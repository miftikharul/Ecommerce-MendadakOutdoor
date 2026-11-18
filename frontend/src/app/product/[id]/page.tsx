'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import Link from 'next/link';
import { ShoppingBag, Heart, ArrowLeft, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function ProductDetailContent() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('');

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  useEffect(() => {
    if (!productId) return;

    fetch(`${API_URL}/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success || data.id) {
          const productData = data.data || data;
          setProduct(productData);
          if (productData.variants && productData.variants.length > 0) {
            setSelectedVariant(productData.variants[0]);
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
      <div className="text-center py-20 text-xs text-slate-400 font-medium">
        Memuat detail produk...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-16 text-center space-y-4">
        <h2 className="text-lg font-bold text-white">Produk Tidak Ditemukan</h2>
        <p className="text-xs text-slate-400">Produk yang kamu cari mungkin sudah dihapus atau tidak tersedia.</p>
        <Link href="/" className="inline-flex items-center space-x-2 bg-[#1e293b] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-orange-600 transition border border-gray-800">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog</span>
        </Link>
      </div>
    );
  }

  const variants = product.variants || [];

  return (
    <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
      {/* Breadcrumb */}
      <div className="text-xs text-slate-400 flex items-center space-x-2">
        <Link href="/" className="hover:text-orange-400 transition">Katalog</Link>
        <span>/</span>
        <span className="text-slate-500">{product.category?.name || product.category || 'Kategori'}</span>
        <span>/</span>
        <span className="font-bold text-slate-200 line-clamp-1">{product.name}</span>
      </div>

      <button 
        onClick={() => router.back()} 
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-orange-400 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali</span>
      </button>

      {/* Main Product Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start bg-[#1e293b] p-8 rounded-3xl border border-gray-800 shadow-sm">
        
        {/* Gallery Image */}
        <div className="space-y-4">
          <div className="bg-[#0f172a] rounded-2xl border border-gray-800 h-80 sm:h-96 flex items-center justify-center relative overflow-hidden">
            <button 
              onClick={() => toggleWishlist(product)} 
              className="absolute top-4 right-4 w-9 h-9 bg-[#1e293b]/95 backdrop-blur rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition cursor-pointer z-10 border border-gray-700"
              title="Simpan ke Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted(product.id) ? 'text-red-500 fill-current' : 'text-slate-300 hover:text-red-400'}`} />
            </button>
            
            {product.image ? (
              <img 
                src={product.image.startsWith('http') ? product.image : `${API_URL}${product.image}`} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            ) : product.images && product.images.length > 0 ? (
              <img 
                src={product.images[0].startsWith('http') ? product.images[0] : `${API_URL}${product.images[0]}`} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-slate-500 text-xs font-medium">[ Tanpa Foto Produk ]</div>
            )}
          </div>
        </div>

        {/* Product Info & Action */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
              {product.category?.name || product.category || 'Outdoor'}
            </span>
            <h1 className="text-xl font-black text-white mt-1 leading-snug">{product.name}</h1>
          </div>

          {/* Price */}
          <div className="bg-[#0f172a] p-4 rounded-2xl border border-gray-800 flex items-baseline space-x-3">
            <span className="text-2xl font-black text-orange-400 font-mono">Rp {product.price?.toLocaleString('id-ID')}</span>
          </div>

          {/* Description */}
          <div className="space-y-2 text-xs text-slate-300 leading-relaxed border-t border-b border-gray-800 py-4">
            <h3 className="font-bold text-white">Deskripsi Perlengkapan:</h3>
            <p>{product.description || 'Peralatan outdoor kualitas premium standar pendakian gunung & camping.'}</p>
          </div>

          {/* Variant Selector */}
          {variants.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-white block">Pilih Varian / Tipe:</label>
              <div className="flex flex-wrap gap-2">
                {variants.map((v: string) => (
                  <button
                    key={v}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border cursor-pointer ${
                      selectedVariant === v
                        ? 'bg-orange-600 text-white border-orange-500'
                        : 'bg-[#0f172a] border-gray-800 text-slate-300 hover:bg-gray-800'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Info */}
          <div className="text-xs text-slate-300 font-medium">
            Stok Tersedia: <strong className="text-white font-bold">{product.stock ?? 'Tersedia'}</strong> unit
          </div>

          {/* Quantity & Add to Cart */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center space-x-4">
              <span className="text-xs font-bold text-white">Jumlah:</span>
              <div className="flex items-center border border-gray-700 rounded-xl px-3 py-1.5 bg-[#0f172a]">
                <button 
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="px-2 font-bold text-slate-300 hover:text-orange-400 text-xs cursor-pointer"
                >
                  -
                </button>
                <span className="px-3 text-xs font-bold font-mono text-white">{quantity}</span>
                <button 
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="px-2 font-bold text-slate-300 hover:text-orange-400 text-xs cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  addToCart({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    weight: product.weight || 1000,
                    image: product.image 
                      ? (product.image.startsWith('http') ? product.image : `${API_URL}${product.image}`)
                      : (product.images && product.images.length > 0 
                          ? (product.images[0].startsWith('http') ? product.images[0] : `${API_URL}${product.images[0]}`) 
                          : ''),
                    variant: selectedVariant || 'Standard',
                    quantity: quantity
                  });
                  toast.success(`Berhasil menambahkan ${quantity}x ${product.name} ke keranjang!`);
                }}
                className="flex-1 bg-orange-600 text-white py-3.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 hover:bg-orange-500 transition shadow-md cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Tambah ke Keranjang</span>
              </button>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-2 pt-4 text-[11px] text-slate-400 text-center border-t border-gray-800">
            <div className="flex flex-col items-center space-y-1">
              <ShieldCheck className="w-4 h-4 text-orange-400" />
              <span>Garansi Resmi</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <Truck className="w-4 h-4 text-orange-400" />
              <span>Kirim Cepat</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <RotateCcw className="w-4 h-4 text-orange-400" />
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
    <main className="min-h-screen bg-[#0b132b] text-slate-100 flex flex-col justify-between">
      <div>
        <Navbar />
        <Suspense fallback={<div className="text-center py-20 text-xs text-slate-400">Memuat produk...</div>}>
          <ProductDetailContent />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}