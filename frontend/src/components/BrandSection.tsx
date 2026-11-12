'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function BrandSection() {
  const brands = [
    { 
      name: 'Mobi Garden', 
      logo: '/mobi garden.jfif' 
    },
    { 
      name: 'Naturehike', 
      logo: '/nature hike.png' 
    },
    { 
      name: 'Blackdog', 
      logo: '/blackdog.png' 
    },
    { 
      name: 'Blackdeer', 
      logo: '/blackdeer.jfif' 
    },
    { 
      name: 'Aonijie', 
      logo: '/aonji.png' 
    },
    { 
      name: 'Coody', 
      logo: '/coody.png'
    },
    { 
      name: 'KZM', 
      logo: '/kzm.png' 
    },
    { 
      name: 'Shinetrip', 
      logo: '/shinetrip.png' 
    },
    { 
      name: 'Mountainhiker', 
      logo: '/mountainhiker.png' 
    },
  ];

  return (
    <section className="bg-white border-y border-gray-200/85 py-10 my-8">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center space-x-1.5 text-orange-600 text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Mitra Brand Resmi</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">
              Brand Ternama di Mendadak Outdoor
            </h3>
          </div>
          <p className="text-xs text-slate-500 max-w-md">
            Jaminan peralatan 100% Original & standar kualitas pendakian dari produsen ternama dunia.
          </p>
        </div>

        {/* Brand Grid Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="bg-slate-50 hover:bg-slate-900 hover:text-white border border-gray-200/90 rounded-2xl p-3 text-center transition-all duration-200 group flex flex-col justify-center items-center shadow-2xs hover:shadow-md cursor-default min-h-[115px]"
            >
              {/* Kotak Logo Diperbesar Menjadi w-16 h-16 Agar Jelas & Proporsional */}
              <div className="w-16 h-16 rounded-xl bg-white border border-slate-200/80 group-hover:border-slate-700 overflow-hidden flex items-center justify-center p-2 transition-all shrink-0 shadow-xs">
                <img 
                  src={brand.logo} 
                  alt={brand.name} 
                  className="w-full h-full object-contain rounded-lg filter grayscale group-hover:grayscale-0 transition duration-300"
                />
              </div>

              {/* Info Teks (Nama Brand) */}
              <div className="w-full mt-2.5">
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-white transition leading-tight truncate px-0.5">
                  {brand.name}
                </h4>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}