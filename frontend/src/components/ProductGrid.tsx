"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProductGridProps {
  products?: any[]; // Untuk yang dikirim dari CatalogContainer
  loading?: boolean; // Opsional
  paginatedProducts?: any[]; // Untuk yang dikirim dari page.tsx lama
  sortedProducts?: any[]; // Opsional
  totalPages?: number; // Opsional
  currentPage?: number; // Opsional
  setCurrentPage?: (page: number) => void; // Opsional
}

export default function ProductGrid({
  products,
  loading = false,
  paginatedProducts,
  sortedProducts,
  totalPages,
  currentPage,
  setCurrentPage,
}: ProductGridProps) {
  const router = useRouter();

  // Ambil data produk dari mana saja yang tersedia
  const displayProducts = paginatedProducts || products || [];
  const totalCount = sortedProducts
    ? sortedProducts.length
    : displayProducts.length;

  // Helper untuk mendapatkan URL gambar yang aman
  const getProductImage = (product: any) => {
    const img = product.image || (product.images && product.images[0]);
    if (!img) return "";
    return img.startsWith("http") ? img : `http://localhost:5000${img}`;
  };

  // Fungsi Tambah ke Keranjang
  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const itemIndex = existingCart.findIndex(
      (item: any) => item.id === product.id,
    );

    const imageUrl = getProductImage(product);

    if (itemIndex > -1) {
      existingCart[itemIndex].quantity += 1;
    } else {
      existingCart.push({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        weight: Number(product.weight || 1000),
        image: imageUrl,
        quantity: 1,
        variant: product.variant || "Standard",
      });
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));
    alert(`🛒 Berhasil memasukkan "${product.name}" ke keranjang!`);
  };

  // Fungsi Beli Langsung (Checkout)
  const handleDirectCheckout = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const imageUrl = getProductImage(product);
    const buyNowItem = [
      {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        weight: Number(product.weight || 1000),
        image: imageUrl,
        quantity: 1,
        variant: product.variant || "Standard",
      },
    ];
    localStorage.setItem("cart", JSON.stringify(buyNowItem));
    router.push("/checkout");
  };

  // Fungsi Simpan ke Wishlist
  const handleToggleWishlist = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const existingWishlist = JSON.parse(
      localStorage.getItem("wishlist") || "[]",
    );
    const isExist = existingWishlist.some(
      (item: any) => item.id === product.id,
    );

    let updatedWishlist = [];
    if (isExist) {
      updatedWishlist = existingWishlist.filter(
        (item: any) => item.id !== product.id,
      );
      alert(`💔 "${product.name}" dihapus dari Wishlist.`);
    } else {
      updatedWishlist = [...existingWishlist, product];
      alert(`❤️ Berhasil menyimpan "${product.name}" ke Wishlist!`);
    }

    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-[#1e293b] p-12 text-center rounded-xl border border-gray-800 shadow-sm">
          <p className="text-gray-400 font-medium">Memuat data produk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Katalog Peralatan Lapangan
          </h2>
          <p className="text-sm text-gray-400">
            Pilih perlengkapan terbaik untuk kenyamanan petualanganmu.
          </p>
        </div>
        <span className="text-sm bg-[#1e293b] px-3 py-1 rounded-full border border-gray-800 text-gray-300 font-medium">
          Menampilkan {displayProducts.length} dari {totalCount} produk
        </span>
      </div>

      {displayProducts.length === 0 ? (
        <div className="bg-[#1e293b] p-12 text-center rounded-xl border border-gray-800 shadow-sm">
          <p className="text-gray-400 font-medium">
            Tidak ada produk yang sesuai dengan filter atau pencarian.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((product: any) => {
            const displayImg = getProductImage(product);
            return (
              <Link
                href={`/product/${product.id}`}
                key={product.id}
                className="bg-[#1e293b] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-800 flex flex-col group relative"
              >
                {/* Tombol Wishlist di pojok kanan atas gambar */}
                <button
                  onClick={(e) => handleToggleWishlist(product, e)}
                  className="absolute top-3 right-3 z-10 bg-[#0f172a]/80 hover:bg-[#0f172a] text-white p-2 rounded-full shadow border border-gray-700 transition cursor-pointer"
                  title="Simpan ke Wishlist"
                >
                  ❤️
                </button>

                <div className="h-52 bg-[#0f172a] relative overflow-hidden">
                  {displayImg ? (
                    <img
                      src={displayImg}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 text-xs">
                      [ Tanpa Foto ]
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-orange-400 transition line-clamp-1 text-base">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {product.description ||
                        "Peralatan outdoor berkualitas tinggi."}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between">
                    <span className="font-extrabold text-orange-400 text-sm">
                      Rp {Number(product.price).toLocaleString("id-ID")}
                    </span>
                    <span className="text-xs bg-[#0f172a] text-gray-300 px-2.5 py-1 rounded-md font-medium border border-gray-800">
                      Stok: {product.stock ?? "10"}
                    </span>
                  </div>

                  {/* Tombol Tambah ke Keranjang & Beli Langsung */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className="bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold py-2 rounded-lg border border-gray-700 transition text-center cursor-pointer"
                    >
                      🛒 +Keranjang
                    </button>
                    <button
                      onClick={(e) => handleDirectCheckout(product, e)}
                      className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold py-2 rounded-lg transition text-center shadow cursor-pointer"
                    >
                      ⚡ Beli Langsung
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages && totalPages > 1 && setCurrentPage && (
        <div className="flex justify-center items-center space-x-2 pt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                currentPage === page
                  ? "bg-orange-600 text-white shadow"
                  : "bg-[#1e293b] text-gray-300 border border-gray-800 hover:bg-gray-800"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}