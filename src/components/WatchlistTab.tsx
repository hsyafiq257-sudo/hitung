/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Eye, Plus, Trash2, TrendingDown, TrendingUp, AlertCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatRupiah, formatPercent, generateId } from "../utils";

interface WatchlistItem {
  id: string;
  ticker: string;
  currentPrice: number;
  targetPrice: string; // Accepts string to support range format like "1000-1200"
  notes: string;
  createdAt: string;
}

export default function WatchlistTab() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("watchlist");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            // Map over items to ensure targetPrice is safely represented as string
            return parsed.map((item: any) => ({
              ...item,
              targetPrice: item.targetPrice !== undefined ? String(item.targetPrice) : "",
            }));
          }
        } catch (e) {
          console.error("Failed to parse watchlist", e);
        }
      }
    }
    // Default initial items
    return [
      {
        id: "default-1",
        ticker: "BBRI",
        currentPrice: 4250,
        targetPrice: "4500",
        notes: "Fundamental kuat, dividen yield historis > 5%. Layak akumulasi saat diskon.",
        createdAt: new Date().toISOString(),
      },
      {
        id: "default-2",
        ticker: "TLKM",
        currentPrice: 3200,
        targetPrice: "2900-3100", // Default with range representation
        notes: "Tunggu koreksi sehat di area support kuat sebelum cicil beli.",
        createdAt: new Date().toISOString(),
      },
      {
        id: "default-3",
        ticker: "GOTO",
        currentPrice: 50,
        targetPrice: "50",
        notes: "Spekulatif taktis. Masuk tipis-tipis di harga batas psikologis.",
        createdAt: new Date().toISOString(),
      },
    ];
  });

  const [ticker, setTicker] = useState("");
  const [currentPrice, setCurrentPrice] = useState<number | "">("");
  const [targetPrice, setTargetPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Helper to parse target price string into boundaries
  const parseTargetPrice = (targetStr: string): { isRange: boolean; min: number; max: number } => {
    const cleanStr = targetStr.replace(/\s+/g, "").trim();
    const parts = cleanStr.split("-");

    if (parts.length === 2) {
      const val1 = parseInt(parts[0], 10);
      const val2 = parseInt(parts[1], 10);
      if (!isNaN(val1) && !isNaN(val2)) {
        return {
          isRange: true,
          min: Math.min(val1, val2),
          max: Math.max(val1, val2),
        };
      }
    }

    const singleVal = parseInt(cleanStr, 10) || 0;
    return {
      isRange: false,
      min: singleVal,
      max: singleVal,
    };
  };

  // Helper to validate target price input
  const validateTargetPrice = (val: string): boolean => {
    const clean = val.replace(/\s+/g, "").trim();
    if (!clean) return false;

    const parts = clean.split("-");
    if (parts.length === 2) {
      const minVal = parseInt(parts[0], 10);
      const maxVal = parseInt(parts[1], 10);
      return !isNaN(minVal) && minVal > 0 && !isNaN(maxVal) && maxVal > 0;
    } else if (parts.length === 1) {
      const valSingle = parseInt(clean, 10);
      return !isNaN(valSingle) && valSingle > 0;
    }
    return false;
  };

  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!ticker.trim()) {
      setErrorMsg("Kode saham (ticker) tidak boleh kosong.");
      return;
    }
    if (currentPrice === "" || currentPrice <= 0) {
      setErrorMsg("Harga saat ini harus lebih besar dari 0.");
      return;
    }
    if (!targetPrice.trim()) {
      setErrorMsg("Area target beli ideal tidak boleh kosong.");
      return;
    }
    if (!validateTargetPrice(targetPrice)) {
      setErrorMsg("Format Target Beli tidak valid. Gunakan angka tunggal (misal: 1000) atau rentang (misal: 1000-1200).");
      return;
    }

    const cleanInput = targetPrice.replace(/\s+/g, "").trim();

    const newItem: WatchlistItem = {
      id: generateId(),
      ticker: ticker.trim().toUpperCase(),
      currentPrice: Number(currentPrice),
      targetPrice: cleanInput,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    setWatchlist([newItem, ...watchlist]);

    // Reset Form
    setTicker("");
    setCurrentPrice("");
    setTargetPrice("");
    setNotes("");
  };

  const handleDelete = (id: string) => {
    setWatchlist(watchlist.filter((item) => item.id !== id));
  };

  return (
    <div id="watchlist-tab-container" className="space-y-12">
      {/* Tab Header Alert */}
      <div id="watchlist-intro-alert" className="bg-indigo-50/80 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-950/50 p-6 rounded-2xl flex items-start gap-4 shadow-sm">
        <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-indigo-600 dark:text-indigo-400 shrink-0">
          <Eye className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Watchlist &amp; Target Price Tracker</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Gunakan modul Watchlist untuk memantau saham incaran Anda secara personal. Fitur ini membantu Anda melacak jarak harga saat ini dengan target beli ideal serta memberikan sinyal instan saat harga memasuki area beli ideal (<span className="text-emerald-600 dark:text-emerald-400 font-bold">Buy Area</span>) atau menjadi sangat murah (<span className="text-teal-600 dark:text-teal-400 font-bold">Strong Buy</span>).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* FORM INPUT WATCHLIST */}
        <div id="watchlist-form-card" className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm h-fit">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
            <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Tambah Saham Pantauan</h3>
          </div>

          <form onSubmit={handleAdd} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-950/30 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Kode Saham / Ticker
              </label>
              <input
                id="watchlist-input-ticker"
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="Contoh: BBCA"
                className="w-full bg-white dark:bg-slate-855 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2.5 text-sm font-bold tracking-wider placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                maxLength={7}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Harga Saat Ini (Rp)
                </label>
                <input
                  id="watchlist-input-current-price"
                  type="number"
                  value={currentPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCurrentPrice(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                  }}
                  placeholder="Contoh: 10050"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Area Target Beli (Rp)
                </label>
                <input
                  id="watchlist-input-target-price"
                  type="text"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="Contoh: 1000 atau 1000-1200"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Catatan / Alasan Analisis (Opsional)
              </label>
              <textarea
                id="watchlist-input-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tulis alasan teknikal/fundamental di sini..."
                rows={3}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
              />
            </div>

            <button
              id="watchlist-add-submit-btn"
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow flex items-center justify-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>TAMBAH KE WATCHLIST</span>
            </button>
          </form>
        </div>

        {/* DAFTAR KARTU WATCHLIST */}
        <div id="watchlist-display-panel" className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Daftar Pantauan Saham ({watchlist.length})
            </h3>
            {watchlist.length > 0 && (
              <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 uppercase tracking-wide">
                Disimpan di Browser
              </span>
            )}
          </div>

          {watchlist.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <Eye className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Watchlist Kosong</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                Silakan tambahkan beberapa kode saham incaran Anda beserta area target harganya menggunakan form di sebelah kiri.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {watchlist.map((item) => {
                  const { isRange, min, max } = parseTargetPrice(item.targetPrice);
                  const displayTarget = isRange 
                    ? `${formatRupiah(min)} - ${formatRupiah(max).replace("Rp", "").trim()}`
                    : formatRupiah(min);

                  let status: "strong_buy" | "buy_area" | "wait" = "wait";
                  let badgeText = "Wait / Pantau";
                  let badgeClass = "px-2.5 py-1 text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50 rounded-full uppercase tracking-wider";
                  let cardBorderClass = "border-slate-200 dark:border-slate-800";
                  let comparisonNode = null;

                  if (isRange) {
                    if (item.currentPrice > max) {
                      status = "wait";
                      badgeText = "Wait / Pantau";
                      badgeClass = "px-2.5 py-1 text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50 rounded-full uppercase tracking-wider";
                      cardBorderClass = "border-slate-200 dark:border-slate-800";
                      const diffPercent = ((item.currentPrice - max) / max) * 100;
                      comparisonNode = (
                        <>
                          <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0" />
                          <span className="text-slate-600 dark:text-slate-400">
                            Berada <strong className="text-amber-600 dark:text-amber-400 font-bold">+{formatPercent(diffPercent)}</strong> di atas batas atas area target beli ({formatRupiah(max)}).
                          </span>
                        </>
                      );
                    } else if (item.currentPrice >= min && item.currentPrice <= max) {
                      status = "buy_area";
                      badgeText = "Buy Area";
                      badgeClass = "px-2.5 py-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50 rounded-full uppercase tracking-wider";
                      cardBorderClass = "border-emerald-300 dark:border-emerald-800/80 shadow-[0_2px_8px_rgba(16,185,129,0.05)]";
                      comparisonNode = (
                        <>
                          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="text-slate-600 dark:text-slate-400">
                            Berada di dalam <strong className="text-emerald-600 dark:text-emerald-400 font-bold">Area Target Beli</strong> ({formatRupiah(min)} - {formatRupiah(max)}).
                          </span>
                        </>
                      );
                    } else {
                      // currentPrice < min
                      status = "strong_buy";
                      badgeText = "Strong Buy";
                      badgeClass = "px-2.5 py-1 text-[10px] font-extrabold text-teal-100 bg-teal-600 dark:bg-teal-700 border border-teal-700 rounded-full uppercase tracking-wider shadow-sm";
                      cardBorderClass = "border-teal-500 dark:border-teal-700/80 shadow-[0_4px_12px_rgba(13,148,136,0.15)]";
                      const diffPercent = ((min - item.currentPrice) / min) * 100;
                      comparisonNode = (
                        <>
                          <TrendingDown className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                          <span className="text-slate-600 dark:text-slate-400">
                            Sangat murah! Berada <strong className="text-teal-600 dark:text-teal-400 font-bold">{formatPercent(diffPercent)}</strong> di bawah batas bawah area target beli ({formatRupiah(min)}).
                          </span>
                        </>
                      );
                    }
                  } else {
                    // Single target value comparison
                    if (item.currentPrice <= min) {
                      status = "buy_area";
                      badgeText = "Buy Area";
                      badgeClass = "px-2.5 py-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50 rounded-full uppercase tracking-wider";
                      cardBorderClass = "border-emerald-300 dark:border-emerald-800/80 shadow-[0_2px_8px_rgba(16,185,129,0.05)]";
                      const diffPercent = ((min - item.currentPrice) / min) * 100;
                      comparisonNode = (
                        <>
                          <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="text-slate-600 dark:text-slate-400">
                            Berada <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatPercent(diffPercent)}</strong> di bawah target beli ideal Anda ({formatRupiah(min)}).
                          </span>
                        </>
                      );
                    } else {
                      status = "wait";
                      badgeText = "Wait / Pantau";
                      badgeClass = "px-2.5 py-1 text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50 rounded-full uppercase tracking-wider";
                      cardBorderClass = "border-slate-200 dark:border-slate-800";
                      const diffPercent = ((item.currentPrice - min) / min) * 100;
                      comparisonNode = (
                        <>
                          <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0" />
                          <span className="text-slate-600 dark:text-slate-400">
                            Berada <strong className="text-amber-600 dark:text-amber-400 font-bold">+{formatPercent(diffPercent)}</strong> di atas target beli ideal Anda ({formatRupiah(min)}).
                          </span>
                        </>
                      );
                    }
                  }

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className={`relative bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm overflow-hidden flex flex-col justify-between transition-colors ${cardBorderClass}`}
                    >
                      {/* Badge Buy Area Indicator on top right corner */}
                      {(status === "buy_area" || status === "strong_buy") && (
                        <div className={`absolute top-0 right-0 text-white text-[9px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 ${
                          status === "strong_buy" ? "bg-teal-600" : "bg-emerald-500"
                        }`}>
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{status === "strong_buy" ? "Strong Buy!" : "Diskon!"}</span>
                        </div>
                      )}

                      <div className="space-y-4">
                        {/* Title and Badge */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-extrabold tracking-wider text-slate-800 dark:text-slate-100">
                              {item.ticker}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                              {new Date(item.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          </div>

                          <span className={badgeClass}>
                            {badgeText}
                          </span>
                        </div>

                        {/* Prices Grid */}
                        <div className="grid grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div>
                            <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                              Harga Saat Ini
                            </span>
                            <span className="text-sm font-extrabold font-mono text-slate-800 dark:text-slate-100">
                              {formatRupiah(item.currentPrice)}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                              Target Beli
                            </span>
                            <span className="text-sm font-extrabold font-mono text-slate-800 dark:text-slate-100">
                              {displayTarget}
                            </span>
                          </div>
                        </div>

                        {/* Comparison logic indicator banner */}
                        <div className="flex items-center gap-2 text-xs">
                          {comparisonNode}
                        </div>

                        {/* Notes section if exists */}
                        {item.notes && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50/20 dark:bg-slate-800/10 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/60 leading-relaxed italic">
                            &ldquo;{item.notes}&rdquo;
                          </div>
                        )}
                      </div>

                      {/* Action buttons (Delete) */}
                      <div className="flex justify-end pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/60">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 px-2.5 py-1.5 rounded-lg transition-all border border-rose-100 dark:border-rose-900/40 uppercase tracking-wider cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
