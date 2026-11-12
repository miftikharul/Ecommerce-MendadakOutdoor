'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calculator, CheckSquare, Square } from 'lucide-react';

export default function BasecampCalculator() {
  const [items, setItems] = useState([
    { id: 1, name: 'Tenda Ekspedisi 4P (Double Layer)', weight: 3.10, checked: true },
    { id: 2, name: 'Airmat Sleeping Matras Comfort', weight: 0.85, checked: true },
    { id: 3, name: 'Cooking Set & Kompor Portable', weight: 0.50, checked: false },
    { id: 4, name: 'Ultra-Lampu & Lentera LED', weight: 0.47, checked: false },
  ]);

  const toggleItem = (id: number) => {
    setItems(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const totalWeight = items
    .filter(item => item.checked)
    .reduce((acc, item) => acc + item.weight, 0)
    .toFixed(2);

  return (
    <section className="max-w-7xl mx-auto px-8 py-8" suppressHydrationWarning>
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-orange-600 mb-1">
              <Calculator className="w-4 h-4 text-orange-500" />
              <span>FITUR INTERAKTIF MENDADAK OUTDOOR</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Kalkulator Beban Basecamp</h2>
            <p className="text-xs text-slate-500 mt-1">
              Pilih perlengkapan yang ingin dibawa untuk mengukur estimasi total beban ransel secara otomatis.
            </p>
          </div>

          <div className="bg-slate-50 border border-gray-200 px-6 py-4 rounded-2xl flex items-center space-x-6 w-full md:w-auto justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Estimasi Bobot Ransel</span>
              <p className="text-2xl font-black text-orange-600 font-mono">{totalWeight} kg</p>
            </div>
            <Link 
              href="/cart"
              className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-orange-500 transition text-center shadow-xs"
            >
              Cek Ringkasan Pesanan
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
                item.checked 
                  ? 'border-orange-500 bg-orange-500/5 shadow-xs' 
                  : 'border-gray-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.checked ? (
                  <CheckSquare className="w-5 h-5 text-orange-500" />
                ) : (
                  <Square className="w-5 h-5 text-slate-300" />
                )}
                <span className={`text-xs font-semibold ${item.checked ? 'text-slate-900' : 'text-slate-500'}`}>
                  {item.name}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-700 font-mono">
                {item.weight} kg
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}