"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import ProductGrid from "@/components/ProductGrid";
import Toast from "@/components/Toast";

export default function CatalogContainer({
  initialProducts,
}: {
  initialProducts: any[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [selectedBrand, setSelectedBrand] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("semua");
  const [sortBy, setSortBy] = useState<string>("terbaru");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // State untuk Toast Notifikasi
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000); // Hilang otomatis dalam 3 detik
  };

  // Ekstrak kategori & brand unik
  const categoryCounts: { [key: string]: number } = {};
  const brandSet = new Set<string>();

  initialProducts.forEach((p: any) => {
    const cat = p.variant || p.category?.name || p.category || "Standard";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    if (p.brand) brandSet.add(p.brand);
  });
  const categories = Object.keys(categoryCounts);

  // Filter Produk
  const filteredProducts = initialProducts.filter((p: any) => {
    const cat = p.variant || p.category?.name || p.category || "Standard";
    const matchesCategory =
      selectedCategory === "Semua" || cat === selectedCategory;
    const matchesBrand = selectedBrand === "Semua" || p.brand === selectedBrand;

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      // Contoh perbaikan di src/components/CatalogContainer.tsx
      p.name.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query)) ||
      (p.brand &&
        (typeof p.brand === "string"
          ? p.brand.toLowerCase().includes(query)
          : p.brand.name && p.brand.name.toLowerCase().includes(query)));

    let matchesPrice = true;
    const price = Number(p.price || 0);
    if (priceRange === "dibawah-100k") matchesPrice = price < 100000;
    else if (priceRange === "100k-500k")
      matchesPrice = price >= 100000 && price <= 500000;
    else if (priceRange === "diatas-500k") matchesPrice = price > 500000;

    return matchesCategory && matchesBrand && matchesSearch && matchesPrice;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
    const priceA = Number(a.price || 0);
    const priceB = Number(b.price || 0);
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();

    if (sortBy === "termurah") return priceA - priceB;
    if (sortBy === "termahal") return priceB - priceA;
    return dateB - dateA;
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div className="space-y-6">
      {/* Navbar dengan Live Search */}
      <Navbar
        selectedCategory={selectedCategory}
        onSelectCategory={(cat: string) => {
          setSelectedCategory(cat);
          setCurrentPage(1);
        }}
        searchQuery={searchQuery}
        onSearchChange={(val: string) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
      />

      {/* Panel Filter & Pencarian */}
      <div className="bg-[#1C2541]/40 p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Cari Produk
            </label>
            <input
              type="text"
              placeholder="Cari tenda, kompor, carrier..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#0B132B] text-white placeholder-slate-400 text-xs px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Rentang Harga
            </label>
            <select
              value={priceRange}
              onChange={(e) => {
                setPriceRange(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#0B132B] text-white text-xs px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="semua">Semua Harga</option>
              <option value="dibawah-100k">Di bawah Rp 100.000</option>
              <option value="100k-500k">Rp 100.000 - Rp 500.000</option>
              <option value="diatas-500k">Di atas Rp 500.000</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Urutkan Berdasarkan
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#0B132B] text-white text-xs px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="terbaru">Terbaru</option>
              <option value="termurah">Harga Termurah</option>
              <option value="termahal">Harga Termahal</option>
            </select>
          </div>
        </div>

        {/* Kategori Horizontal */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center space-x-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">
            Kategori:
          </span>
          <button
            onClick={() => {
              setSelectedCategory("Semua");
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${selectedCategory === "Semua" ? "bg-orange-500 text-white shadow-md" : "bg-[#0B132B] text-slate-400 hover:text-white border border-slate-800"}`}
          >
            Semua ({initialProducts.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${selectedCategory === cat ? "bg-orange-500 text-white shadow-md" : "bg-[#0B132B] text-slate-400 hover:text-white border border-slate-800"}`}
            >
              {cat} ({categoryCounts[cat]})
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-xl font-black text-white">
            Katalog Peralatan Lapangan
          </h2>
          <p className="text-xs text-slate-400">
            Pilih perlengkapan terbaik untuk kenyamanan petualanganmu.
          </p>
        </div>
        <span className="text-xs font-bold text-slate-400">
          Menampilkan {paginatedProducts.length} dari {sortedProducts.length}{" "}
          produk
        </span>
      </div>

      {/* Grid Produk */}
      <ProductGrid
        loading={false}
        paginatedProducts={paginatedProducts}
        sortedProducts={sortedProducts}
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {/* Komponen Toast Notifikasi */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
