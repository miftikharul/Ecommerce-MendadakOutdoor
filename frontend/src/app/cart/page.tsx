'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Trash2, ArrowLeft, ShieldCheck, CreditCard } from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <main className="min-h-screen bg-[#0b132b]" />;
  }

  return (
    <main className="min-h-screen bg-[#0b132b] text-slate-100 flex flex-col justify-between">
      <div>
        <Navbar />
        <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-white">Keranjang Peralatan Lapangan</h1>
            <Link href="/" className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-orange-400 transition">
              <ArrowLeft className="w-4 h-4" /><span>Lanjut Belanja</span>
            </Link>
          </div>

          {cart.length === 0 ? (
            <div className="bg-[#1e293b] p-12 rounded-3xl border border-gray-800 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-[#0f172a] rounded-full flex items-center justify-center mx-auto text-slate-400 border border-gray-800">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">Keranjang Belanjamu Masih Kosong</h3>
              <p className="text-xs text-slate-400">Belum ada perlengkapan outdoor yang kamu masukkan ke keranjang.</p>
              <Link href="/" className="inline-flex items-center space-x-2 bg-orange-600 text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-orange-500 transition shadow">
                <ArrowLeft className="w-4 h-4" /><span>Eksplorasi Katalog Produk</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-[#1e293b] rounded-3xl border border-gray-800 p-6 space-y-4 shadow-sm">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-800 text-xs text-slate-400 font-medium">
                    <span>Item Perlengkapan ({totalItems})</span>
                    <span>Subtotal</span>
                  </div>
                  <div className="divide-y divide-gray-800">
                    {cart.map((item) => (
                      <div key={`${item.id}-${item.variant || 'Standard'}`} className="py-4 flex gap-4 items-center justify-between">
                        <div className="flex gap-4 items-center">
                          <div className="w-16 h-16 bg-[#0f172a] rounded-2xl border border-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] text-slate-500">Foto</span>
                            )}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{item.name}</h4>
                            <p className="text-[11px] text-slate-400">Varian: {item.variant || 'Standard'}</p>
                            <p className="text-xs font-bold font-mono text-orange-400">Rp {item.price?.toLocaleString('id-ID')}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center border border-gray-700 rounded-xl px-2.5 py-1 bg-[#0f172a]">
                            <button 
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), item.variant)} 
                              className="px-1.5 font-bold text-xs text-slate-300 hover:text-orange-400 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="px-2.5 text-xs font-bold font-mono text-white">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)} 
                              className="px-1.5 font-bold text-xs text-slate-300 hover:text-orange-400 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black font-mono text-white">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                            <button 
                              onClick={() => removeFromCart(item.id, item.variant)} 
                              className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 mt-1 ml-auto cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /><span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-orange-950/30 border border-orange-900/50 rounded-2xl p-4 flex items-center space-x-3 text-xs text-orange-300">
                  <ShieldCheck className="w-5 h-5 text-orange-400 shrink-0" />
                  <span>Semua produk dilindungi <strong>Garansi Resmi Mendadak Outdoor</strong>.</span>
                </div>
              </div>

              {/* Ringkasan & Tombol ke Checkout */}
              <div className="bg-[#1e293b] p-6 rounded-3xl border border-gray-800 space-y-5 shadow-sm sticky top-24">
                <h3 className="text-sm font-bold pb-3 border-b border-gray-800 text-white">Ringkasan Pesanan</h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Total Barang ({totalItems} item)</span>
                    <span className="font-mono font-bold text-white">Rp {totalPrice.toLocaleString('id-ID')}</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-800 flex justify-between items-baseline">
                  <span className="text-xs font-bold text-white">Total Tagihan</span>
                  <span className="text-lg font-black font-mono text-orange-400">Rp {totalPrice.toLocaleString('id-ID')}</span>
                </div>
                <button 
                  onClick={() => router.push('/checkout')} 
                  className="w-full bg-orange-600 text-white py-3.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 hover:bg-orange-500 shadow-md transition cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" /><span>Lanjut ke Halaman Checkout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}