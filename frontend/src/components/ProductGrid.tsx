"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface ProductGridProps {
  products?: any[];
  loading?: boolean;
  paginatedProducts?: any[];
  sortedProducts?: any[];
  totalPages?: number;
  currentPage?: number;
  setCurrentPage?: (page: number) => void;
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
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { addToCart } = useCart();

  const displayProducts = paginatedProducts || products || [];
  const totalCount = sortedProducts
    ? sortedProducts.length
    : displayProducts.length;

  const getProductImage = (product: any) => {
    const img = product.image || (product.images && product.images[0]);
    if (!img) return "";
    return img.startsWith("http") ? img : `${API_URL}${img}`;
  };

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const imageUrl = getProductImage(product);
    
    // Menggunakan fungsi addToCart dari CartContext yang sudah ada
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      weight: Number(product.weight || 1000),
      image: imageUrl,
      quantity: 1,
      variant: product.variant || "Standard",
    });

    alert(`🛒 Berhasil memasukkan "${product.name}" ke keranjang!`);
  };

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

  const handleToggleWishlist = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Menggunakan toggleWishlist dari WishlistContext agar langsung sinkron dengan halaman /wishlist
    toggleWishlist(product);
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
            const isFav = isWishlisted(product.id);

            return (
              <div
                key={product.id}
                className="bg-[#1e293b] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-800 flex flex-col relative"
              >
                {/* Tombol Wishlist Dinamis (Warna merah jika sudah di-wishlist) */}
                <button
                  type="button"
                  onClick={(e) => handleToggleWishlist(product, e)}
                  className="absolute top-3 right-3 z-30 bg-[#0f172a]/90 hover:bg-[#0f172a] p-2 rounded-full shadow border border-gray-700 transition cursor-pointer"
                  title="Simpan ke Wishlist"
                >
                  <span className={isFav ? "text-red-500" : "text-gray-400"}>
                    {isFav ? "❤️" : "🤍"}
                  </span>
                </button>

                {/* Bagian Gambar (Klik untuk ke Detail) */}
                <div
                  onClick={() => router.push(`/product/${product.id}`)}
                  className="h-52 bg-[#0f172a] relative overflow-hidden cursor-pointer"
                >
                  {displayImg ? (
                    <img
                      src={displayImg}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 text-xs">
                      [ Tanpa Foto ]
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-grow justify-between">
                  <div>
                    <h3
                      onClick={() => router.push(`/product/${product.id}`)}
                      className="font-semibold text-white hover:text-orange-400 transition line-clamp-1 text-base cursor-pointer"
                    >
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

                  {/* Tombol Keranjang & Beli Langsung */}
                  <div className="grid grid-cols-2 gap-2 mt-4 z-20">
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(product, e)}
                      className="bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold py-2 rounded-lg border border-gray-700 transition text-center cursor-pointer"
                    >
                      🛒 +Keranjang
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDirectCheckout(product, e)}
                      className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold py-2 rounded-lg transition text-center shadow cursor-pointer"
                    >
                      ⚡ Beli Langsung
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
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