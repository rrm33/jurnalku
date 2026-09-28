"use client";

import { useState } from "react";
import Link from "next/link";
import { LogIn } from "lucide-react";
import ToolsBundle from "@/components/ToolsBundle";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-rose-200">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/icon.png" alt="Logo Jurnalku" className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-sm" />
            <h1 className="font-extrabold text-slate-800 text-xl tracking-tight">Jurnalku<span className="text-rose-600">.</span></h1>
          </div>
          <Link href="/login" className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-xl transition-all shadow-sm text-sm">
            <LogIn size={16} /> Login Jurnal
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-rose-50 to-slate-50 pt-16 pb-12 px-4 border-b border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black text-slate-800 mb-4 leading-tight">
            Alat Produktivitas <span className="text-rose-600">Gratis</span> untuk Semua.
          </h2>
          <p className="text-slate-500 text-base md:text-lg mb-8 max-w-2xl mx-auto">
            Gunakan berbagai alat bantu pendidikan secara gratis langsung dari browser Anda tanpa perlu mengunduh aplikasi tambahan. Aman, cepat, dan tidak menyimpan data Anda.
          </p>
        </div>
      </section>

      {/* Tools Section */}
      <section className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <ToolsBundle />
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-slate-400">© {new Date().getFullYear()} Jurnalku. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
