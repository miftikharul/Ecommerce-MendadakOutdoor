'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, ChevronRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0B132B] text-slate-300 border-t border-slate-800/80 text-xs mt-auto">
      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* 1. Brand Info & Logo */}
          <div className="space-y-4">
            <div className="inline-flex items-center bg-white rounded-xl p-2 shadow-sm">
              <Image 
                src="/logo.jpeg" 
                alt="Mendadak Outdoor Logo" 
                width={130} 
                height={36} 
                className="h-8 w-auto object-contain"
              />
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Solusi praktis perlengkapan mendaki, kemping, dan petualangan outdoor dengan kualitas peralatan terjamin standar ekspedisi.
            </p>
          </div>

          {/* 2. Quick Links */}
          <div className="space-y-3.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider border-b border-slate-800 pb-2">
              Navigasi
            </h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li>
                <Link href="/" className="hover:text-orange-400 transition-colors inline-flex items-center space-x-1">
                  <ChevronRight className="w-3 h-3 text-orange-500" />
                  <span>Katalog Utama</span>
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-orange-400 transition-colors inline-flex items-center space-x-1">
                  <ChevronRight className="w-3 h-3 text-orange-500" />
                  <span>Keranjang Belanja</span>
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-orange-400 transition-colors inline-flex items-center space-x-1">
                  <ChevronRight className="w-3 h-3 text-orange-500" />
                  <span>Wishlist Favorit</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Categories (Diselaraskan ke 4 Kategori Utama) */}
          <div className="space-y-3.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider border-b border-slate-800 pb-2">
              Kategori Peralatan
            </h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li>
                <Link href="/?category=Tenda" className="hover:text-orange-400 transition-colors inline-flex items-center space-x-1">
                  <ChevronRight className="w-3 h-3 text-orange-500" />
                  <span>Tenda & Shelter</span>
                </Link>
              </li>
              <li>
                <Link href="/?category=Meja" className="hover:text-orange-400 transition-colors inline-flex items-center space-x-1">
                  <ChevronRight className="w-3 h-3 text-orange-500" />
                  <span>Meja Lipat</span>
                </Link>
              </li>
              <li>
                <Link href="/?category=Kompor" className="hover:text-orange-400 transition-colors inline-flex items-center space-x-1">
                  <ChevronRight className="w-3 h-3 text-orange-500" />
                  <span>Kompor & Portable</span>
                </Link>
              </li>
              <li>
                <Link href="/?category=Lampu" className="hover:text-orange-400 transition-colors inline-flex items-center space-x-1">
                  <ChevronRight className="w-3 h-3 text-orange-500" />
                  <span>Lampu & Lentera</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. Contact Info */}
          <div className="space-y-3.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider border-b border-slate-800 pb-2">
              Hubungi Kami
            </h4>
            <ul className="space-y-3 text-slate-400 text-xs">
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span className="leading-tight">Basecamp Mendadak Outdoor, Bogor, Jawa Barat</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-orange-500 shrink-0" />
                <span>+62 812-3456-7890</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                <span>info@mendadakoutdoor.com</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-[#070C1B] py-4 text-center text-xs text-slate-500 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4">
          &copy; 2026 <span className="text-slate-300 font-semibold">Mendadak Outdoor</span>. All rights reserved.
        </div>
      </div>
    </footer>
  );
}