import { Suspense } from 'react';
import Link from 'next/link';
import CatalogContainer from '@/components/CatalogContainer';
import Toast from '@/components/Toast';

async function getProducts() {
  try {
    const res = await fetch('http://localhost:5000/api/products', { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.data || []);
  } catch (error) {
    console.error('Gagal mengambil data produk di server:', error);
    return [];
  }
}

async function CatalogWrapper() {
  const products = await getProducts();
  return <CatalogContainer initialProducts={products} />;
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0b132b] text-slate-100 flex flex-col justify-between">
      {/* Bungkus dengan Suspense sesuai instruksi error Next.js */}
      <div className="max-w-7xl mx-auto px-6 py-6 w-full">
        <Suspense fallback={<div className="text-center py-20 text-slate-400">Memuat katalog perlengkapan...</div>}>
          <CatalogWrapper />
        </Suspense>
      </div>

      {/* Footer (Server Rendered) */}
      <footer className="bg-[#0f172a] text-gray-400 py-10 px-6 mt-16 border-t border-gray-800 text-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="bg-white px-4 py-2 rounded-xl inline-block mb-3 shadow-md">
              <img src="logo.jpeg" alt="Mendadak Outdoor" className="h-9 w-auto object-contain" />
            </div>
            <p className="text-xs text-gray-400">
              Solusi praktis perlengkapan mendaki, kemping, dan petualangan outdoor dengan kualitas peralatan terjamin standar ekspedisi.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">NAVIGASI</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-white transition">Katalog Utama</Link></li>
              <li><Link href="/cart" className="hover:text-white transition">Keranjang Belanja</Link></li>
              <li><Link href="/tracking" className="hover:text-white transition">Cek Resi Pesanan</Link></li>
              <li><Link href="/wishlist" className="hover:text-white transition">Wishlist Favorit</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">KATEGORI PERALATAN</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white transition cursor-pointer">Tenda & Shelter</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Meja & Kursi Lipat</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Kompor & Portable</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Lampu & Lentera</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">HUBUNGI KAMI</h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>📍 Basecamp Mendadak Outdoor, Bogor, Jawa Barat</li>
              <li>📞 +62 812-2553-0033</li>
              <li>✉️ info@mendadakoutdoor.com</li>
            </ul>
          </div>
        </div>
      </footer>
    </main>
  );
}