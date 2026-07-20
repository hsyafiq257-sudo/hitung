/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { LineChart, Briefcase, Building, HelpCircle, Info, Calculator, ExternalLink, PieChart, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import Header from "./components/Header";
import TradingTab from "./components/TradingTab";
import InvestingTab from "./components/InvestingTab";
import CompoundingTab from "./components/CompoundingTab";
import CorporateActionTab from "./components/CorporateActionTab";
import PortfolioTab from "./components/PortfolioTab";
import WatchlistTab from "./components/WatchlistTab";
import { Eye } from "lucide-react";

type ActiveTab = "trading" | "investing" | "compounding" | "portfolio" | "corporate" | "watchlist";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("trading");
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        return savedTheme === "dark";
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <div id="app-root-container" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header section with market ribbons */}
      <Header />

      {/* Main Container */}
      <main id="main-content-area" className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        
        {/* Intro Alert */}
        <div id="intro-info-card" className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start gap-3.5 shadow-sm">
          <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-800">Kalkulator Saham Komprehensif v1.0:</span> Silakan pilih kategori kalkulator yang Anda inginkan menggunakan navigasi tab di bawah. Seluruh perhitungan dirancang presisi sesuai dengan sistem fraksi harga, pembulatan lot, serta struktur fee transaksi pasar modal Indonesia (BEI). Perhitungan berjalan secara real-time saat Anda mengubah nilai input.
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div id="navigation-tabs-bar" className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 flex-1">
            {/* Tab: TRADING */}
            <button
              id="tab-btn-trading"
              type="button"
              onClick={() => setActiveTab("trading")}
              className={`flex flex-col md:flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs md:text-sm tracking-wide uppercase transition-all cursor-pointer ${
                activeTab === "trading"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/40"
              }`}
            >
              <LineChart className="w-4 h-4 md:w-5 h-5" />
              <span>Trading</span>
            </button>

            {/* Tab: INVESTING */}
            <button
              id="tab-btn-investing"
              type="button"
              onClick={() => setActiveTab("investing")}
              className={`flex flex-col md:flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs md:text-sm tracking-wide uppercase transition-all cursor-pointer ${
                activeTab === "investing"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/40"
              }`}
            >
              <Briefcase className="w-4 h-4 md:w-5 h-5" />
              <span>Investing</span>
            </button>

            {/* Tab: COMPOUNDING */}
            <button
              id="tab-btn-compounding"
              type="button"
              onClick={() => setActiveTab("compounding")}
              className={`flex flex-col md:flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs md:text-sm tracking-wide uppercase transition-all cursor-pointer ${
                activeTab === "compounding"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/40"
              }`}
            >
              <Calculator className="w-4 h-4 md:w-5 h-5" />
              <span>Compounding</span>
            </button>

            {/* Tab: PORTFOLIO */}
            <button
              id="tab-btn-portfolio"
              type="button"
              onClick={() => setActiveTab("portfolio")}
              className={`flex flex-col md:flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs md:text-sm tracking-wide uppercase transition-all cursor-pointer ${
                activeTab === "portfolio"
                  ? "bg-white text-violet-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/40"
              }`}
            >
              <PieChart className="w-4 h-4 md:w-5 h-5" />
              <span>Alokasi</span>
            </button>

            {/* Tab: CORPORATE ACTION */}
            <button
              id="tab-btn-corporate"
              type="button"
              onClick={() => setActiveTab("corporate")}
              className={`flex flex-col md:flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs md:text-sm tracking-wide uppercase transition-all cursor-pointer ${
                activeTab === "corporate"
                  ? "bg-white text-amber-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/40"
              }`}
            >
              <Building className="w-4 h-4 md:w-5 h-5" />
              <span className="text-center">Corp Action</span>
            </button>

            {/* Tab: WATCHLIST */}
            <button
              id="tab-btn-watchlist"
              type="button"
              onClick={() => setActiveTab("watchlist")}
              className={`flex flex-col md:flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs md:text-sm tracking-wide uppercase transition-all cursor-pointer ${
                activeTab === "watchlist"
                  ? "bg-white text-rose-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/40"
              }`}
            >
              <Eye className="w-4 h-4 md:w-5 h-5" />
              <span>Watchlist</span>
            </button>
          </div>

          <button
            id="theme-toggle-btn"
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center justify-center gap-2 p-3 px-4 sm:p-2.5 sm:px-3 rounded-xl font-bold text-xs tracking-wide uppercase transition-all duration-300 cursor-pointer bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 active:scale-95 shrink-0"
            title={darkMode ? "Aktifkan Mode Terang" : "Aktifkan Mode Gelap"}
          >
            {darkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="sm:hidden md:inline">Mode Terang</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="sm:hidden md:inline">Mode Gelap</span>
              </>
            )}
          </button>
        </div>

        {/* Dynamic Calculator Tab Wrapper with Smooth Fade-in */}
        <div id="calculator-tab-view-viewport" className="relative">
          <AnimatePresence mode="wait">
            {activeTab === "trading" && (
              <motion.div
                key="trading-tab-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <TradingTab />
              </motion.div>
            )}

            {activeTab === "investing" && (
              <motion.div
                key="investing-tab-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <InvestingTab />
              </motion.div>
            )}

            {activeTab === "compounding" && (
              <motion.div
                key="compounding-tab-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <CompoundingTab />
              </motion.div>
            )}

            {activeTab === "portfolio" && (
              <motion.div
                key="portfolio-tab-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <PortfolioTab />
              </motion.div>
            )}

            {activeTab === "corporate" && (
              <motion.div
                key="corporate-tab-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <CorporateActionTab />
              </motion.div>
            )}

            {activeTab === "watchlist" && (
              <motion.div
                key="watchlist-tab-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <WatchlistTab />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Education FAQ Accordion Section */}
        <section id="faq-education-section" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
            <HelpCircle className="w-6 h-6 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-800">Informasi Penting &amp; Glosarium Saham</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
            <div className="space-y-3">
              <p>
                <strong className="text-indigo-600 block mb-1">Lot Saham Indonesia:</strong>
                Di Bursa Efek Indonesia (BEI), satuan perdagangan saham standar adalah Lot, di mana <strong>1 Lot setara dengan 100 lembar saham</strong>. Semua perhitungan modal dan jumlah dividen didasarkan pada perkalian lot standar ini.
              </p>
              <p>
                <strong className="text-emerald-600 block mb-1">Dollar Cost Averaging (DCA):</strong>
                Strategi investasi di mana Anda membeli saham dalam jumlah Rupiah yang sama secara rutin setiap bulan, tanpa mempedulikan fluktuasi harga. Jika harga turun Anda mendapat lebih banyak lot; jika harga naik Anda mendapat lebih sedikit lot.
              </p>
            </div>
            <div className="space-y-3">
              <p>
                <strong className="text-amber-700 block mb-1">Aksi Korporasi (Stock Split / Right Issue):</strong>
                <strong>Stock Split</strong> dilakukan untuk menurunkan harga saham per lembar agar lebih likuid bagi ritel tanpa mengubah nilai total kapitalisasi. Sedangkan <strong>Right Issue (HMETD)</strong> adalah emisi saham baru yang ditawarkan ke pemegang saham lama terlebih dahulu untuk menambah modal korporasi.
              </p>
              <p>
                <strong className="text-indigo-600 block mb-1">Margin of Safety (MoS):</strong>
                Konsep investasi nilai (value investing) dari Benjamin Graham yang menyarankan membeli saham hanya ketika harganya berada jauh di bawah nilai intrinsiknya (biasanya target diskon minimal 30%) untuk meminimalkan risiko penurunan harga.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer copyright */}
      <footer id="app-footer-bar" className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; {new Date().getFullYear()} Kalkulator Saham Komprehensif. Hak Cipta Dilindungi.</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Didesain dengan presisi keuangan <span className="text-rose-500">♥</span> di Indonesia
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
