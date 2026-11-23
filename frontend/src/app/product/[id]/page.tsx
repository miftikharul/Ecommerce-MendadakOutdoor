'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import Link from 'next/link';
import { ShoppingBag, Heart, ArrowLeft, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ProductDetail {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock?: number | null;
  weight?: number | null;
  image?: string | null;
  images?: string[] | null;
  variant?: string | null;
  variants?: string[] | null;
  category?: { name?: string } | string | null;
}

interface ProductApiResponse {
  success?: boolean;
  id?: string;
  data?: ProductDetail;
}

const resolveImageUrl = (src?: string | null) => {
  if (!src) return '';
  return src.startsWith('http') ? src : `${API_URL}${src}`;
};

function ProductDetailContent({ productId }: { productId: string }) {
  const router = useRouter();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  useEffect(() => {
    if (!productId) return;

    let active = true;

    fetch(`${API_URL}/api/products/${productId}`)
      .then((res) => res.json())
      .then((raw: ProductApiResponse & ProductDetail) => {
        if (!active) return;

        const productData = raw.data || (raw.id ? raw : null);
        if (productData && productData.id) {
          setProduct(productData);

          const normalizedVariants: string[] = Array.isArray(productData.variants)
            ? productData.variants.filter((v): v is string => Boolean(v))
            : typeof productData.variant === 'string' && productData.variant.trim() !== ''
              ? [productData.variant.trim()]
              : [];

          setSelectedVariant(normalizedVariants[0] || 'Standard');
        } else {
          setProduct(null);
        }

        setActiveImageIndex(0);
        setBrokenImages({});
        setQuantity(1);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        console.error('Gagal mengambil detail produk:', err);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [productId]);

  const galleryImages = useMemo(() => {
    if (!product) return [] as string[];
    const rawList: string[] = [];

    if (Array.isArray(product.images)) {
      rawList.push(...product.images.filter((img): img is string => Boolean(img)));
    }
    if (typeof product.image === 'string' && product.image.trim() !== '') {
      rawList.push(product.image.trim());
    }

    const resolved = rawList
      .map((img) => resolveImageUrl(img))
      .filter((url) => url !== '' && !brokenImages[url]);

    return Array.from(new Set(resolved));
  }, [product, brokenImages]);

  const variants = useMemo(() => {
    if (!product) return [] as string[];
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      return product.variants.filter((v): v is string => Boolean(v));
    }
    if (typeof product.variant === 'string' && product.variant.trim() !== '') {
      return [product.variant.trim()];
    }
    return [];
  }, [product]);

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

  const categoryLabel =
    typeof product.category === 'object' && product.category !== null
      ? product.category.name || 'Kategori'
      : product.category || 'Kategori';

  const hasNumericStock = typeof product.stock === 'number';
 const maxStock = typeof product.stock === 'number' ? Math.max(0, product.stock) : Infinity;
  const isOutOfStock = hasNumericStock && maxStock <= 0;
  const activeImageUrl = galleryImages[activeImageIndex] || galleryImages[0] || '';

  const handleIncreaseQty = () => {
    setQuantity((prev) => {
      if (hasNumericStock) {
        return Math.min(prev + 1, Math.max(1, maxStock));
      }
      return prev + 1;
    });
  };

  const handleDecreaseQty = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error('Stok produk sedang habis.');
      return;
    }

    const safeQty: number = hasNumericStock ? Math.min(quantity, maxStock) : quantity;
    const finalQty: number = Number(safeQty) || 1;
    const chosenVariant: string = selectedVariant || product.variant || 'Standard';
    const finalPrice: number = Number(product.price) || 0;
    const finalWeight: number =
      typeof product.weight === 'number' && !Number.isNaN(product.weight) ? product.weight : 1000;

    addToCart(
      {
        id: product.id,
        name: product.name,
        price: finalPrice,
        weight: finalWeight,
        image: activeImageUrl,
        variant: chosenVariant,
      },
      finalQty,
      chosenVariant
    );

    toast.success(`Berhasil menambahkan ${finalQty}x ${product.name} ke keranjang!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
      <div className="text-xs text-slate-400 flex items-center space-x-2">
        <Link href="/" className="hover:text-orange-400 transition">Katalog</Link>
        <span>/</span>
        <span className="text-slate-500">{categoryLabel}</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start bg-[#1e293b] p-8 rounded-3xl border border-gray-800 shadow-sm">
        <div className="space-y-3">
          <div className="bg-[#0f172a] rounded-2xl border border-gray-800 h-80 sm:h-96 flex items-center justify-center relative overflow-hidden">
            <button
              onClick={() => toggleWishlist(product)}
              className="absolute top-4 right-4 w-9 h-9 bg-[#1e293b]/95 backdrop-blur rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition cursor-pointer z-10 border border-gray-700"
              title="Simpan ke Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted(product.id) ? 'text-red-500 fill-current' : 'text-slate-300 hover:text-red-400'}`} />
            </button>

            {activeImageUrl ? (
              <img
                src={activeImageUrl}
                alt={`${product.name} - foto ${activeImageIndex + 1}`}
                onError={() =>
                  setBrokenImages((prev) => ({ ...prev, [activeImageUrl]: true }))
                }
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-slate-500 text-xs font-medium">[ Tanpa Foto Produk ]</div>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {galleryImages.map((imgUrl, idx) => (
                <button
                  key={imgUrl}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border transition shrink-0 cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-orange-500 ring-2 ring-orange-500/30'
                      : 'border-gray-800 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    onError={() =>
                      setBrokenImages((prev) => ({ ...prev, [imgUrl]: true }))
                    }
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
              {categoryLabel}
            </span>
            <h1 className="text-xl font-black text-white mt-1 leading-snug">{product.name}</h1>
          </div>

          <div className="bg-[#0f172a] p-4 rounded-2xl border border-gray-800 flex items-baseline space-x-3">
            <span className="text-2xl font-black text-orange-400 font-mono">Rp {product.price?.toLocaleString('id-ID')}</span>
          </div>

          <div className="space-y-2 text-xs text-slate-300 leading-relaxed border-t border-b border-gray-800 py-4">
            <h3 className="font-bold text-white">Deskripsi Perlengkapan:</h3>
            <p>{product.description || 'Peralatan outdoor kualitas premium standar pendakian gunung & camping.'}</p>
          </div>

          {variants.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-white block">Pilih Varian / Tipe:</label>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v}
                    type="button"
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

          <div className="text-xs text-slate-300 font-medium">
            Stok Tersedia:{' '}
            <strong className={`font-bold ${isOutOfStock ? 'text-red-400' : 'text-white'}`}>
              {hasNumericStock ? `${maxStock} unit` : 'Tersedia'}
            </strong>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center space-x-4">
              <span className="text-xs font-bold text-white">Jumlah:</span>
              <div className="flex items-center border border-gray-700 rounded-xl px-3 py-1.5 bg-[#0f172a]">
                <button
                  type="button"
                  onClick={handleDecreaseQty}
                  disabled={isOutOfStock || quantity <= 1}
                  className="px-2 font-bold text-slate-300 hover:text-orange-400 disabled:opacity-40 text-xs cursor-pointer"
                >
                  -
                </button>
                <span className="px-3 text-xs font-bold font-mono text-white">{isOutOfStock ? 0 : quantity}</span>
                <button
                  type="button"
                  onClick={handleIncreaseQty}
                  disabled={isOutOfStock || (hasNumericStock && quantity >= maxStock)}
                  className="px-2 font-bold text-slate-300 hover:text-orange-400 disabled:opacity-40 text-xs cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 bg-orange-600 text-white py-3.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 hover:bg-orange-500 disabled:bg-gray-700 disabled:text-gray-400 transition shadow-md cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Stok Habis' : 'Tambah ke Keranjang'}</span>
              </button>
            </div>
          </div>

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
  const params = useParams();
  const productId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  return (
    <main className="min-h-screen bg-[#0b132b] text-slate-100 flex flex-col justify-between">
      <div>
        <Navbar />
        <Suspense fallback={<div className="text-center py-20 text-xs text-slate-400">Memuat produk...</div>}>
          <ProductDetailContent key={productId} productId={productId} />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}