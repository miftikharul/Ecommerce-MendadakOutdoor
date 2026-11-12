'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import CategorySection from '@/components/CategorySection';
import CatalogHeader from '@/components/CatalogHeader';
import ProductGrid from '@/components/ProductGrid';
import BrandSection from '@/components/BrandSection';
import Footer from '@/components/Footer';
import BasecampCalculator from '@/components/BasecampCalculator';

function HomeContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');

  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'Semua');

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then((res) => res.json())
      .then((data) => data.success && setProducts(data.data));
  }, []);

  let filteredProducts =
    selectedCategory === 'Semua'
      ? products
      : products.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase());

  if (searchParam) {
    filteredProducts = filteredProducts.filter((p) =>
      p.name?.toLowerCase().includes(searchParam.toLowerCase())
    );
  }

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 font-sans flex flex-col justify-between">
      <div>
        <Navbar selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pt-6 pb-24">
          <HeroSection />
          
          <CategorySection 
            selectedCategory={selectedCategory} 
            setSelectedCategory={setSelectedCategory} 
          />
          <BrandSection />
        
          <section id="katalog" className="space-y-6">
            <CatalogHeader 
              selectedCategory={selectedCategory} 
              setSelectedCategory={setSelectedCategory} 
            />
            <ProductGrid products={filteredProducts} />
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B132B]" />}>
      <HomeContent />
    </Suspense>
  );
}