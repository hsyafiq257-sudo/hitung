/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Wallet, Landmark, ShieldCheck, AlertCircle, TrendingUp, Coins, Percent } from "lucide-react";
import { formatRupiah, formatNumber, formatPercent, generateId } from "../utils";
import { DCAMonthlyPriceRow } from "../types";

export default function InvestingTab() {
  // =========================================================
  // 1. STATE & LOGIC: DCA CALCULATOR WITH YIELD PROJECTION
  // =========================================================
  const [dcaMonthlyBudget, setDcaMonthlyBudget] = useState<number | "">(1000000);
  const [dcaMonthsCount, setDcaMonthsCount] = useState<number | "">(6);
  const [dcaYield, setDcaYield] = useState<number | "">(4.5);
  const [dcaCurrentPrice, setDcaCurrentPrice] = useState<number | "">(5500);
  const [dcaPrices, setDcaPrices] = useState<DCAMonthlyPriceRow[]>([
    { id: generateId(), monthIndex: 1, price: 5000 },
    { id: generateId(), monthIndex: 2, price: 4800 },
    { id: generateId(), monthIndex: 3, price: 4600 },
    { id: generateId(), monthIndex: 4, price: 4900 },
    { id: generateId(), monthIndex: 5, price: 5100 },
    { id: generateId(), monthIndex: 6, price: 5300 },
  ]);

  // Adjust monthly price inputs when the count input changes
  useEffect(() => {
    if (dcaMonthsCount === "" || dcaMonthsCount < 1) return;
    if (dcaPrices.length === dcaMonthsCount) return;

    if (dcaPrices.length < dcaMonthsCount) {
      // Add more rows
      const newRows = [...dcaPrices];
      const lastPrice = dcaPrices.length > 0 ? dcaPrices[dcaPrices.length - 1].price : 5000;
      for (let i = dcaPrices.length + 1; i <= dcaMonthsCount; i++) {
        newRows.push({ id: generateId(), monthIndex: i, price: lastPrice });
      }
      setDcaPrices(newRows);
    } else {
      // Trim rows
      setDcaPrices(dcaPrices.slice(0, dcaMonthsCount));
    }
  }, [dcaMonthsCount]);

  const updateDcaPriceRow = (id: string, newPrice: number | "") => {
    setDcaPrices(dcaPrices.map((row) => (row.id === id ? { ...row, price: newPrice } : row)));
  };

  const addDcaMonthRow = () => {
    const nextIndex = dcaPrices.length + 1;
    const lastPrice = dcaPrices.length > 0 ? dcaPrices[dcaPrices.length - 1].price : 5000;
    setDcaPrices([...dcaPrices, { id: generateId(), monthIndex: nextIndex, price: lastPrice }]);
    setDcaMonthsCount(nextIndex);
  };

  const removeDcaMonthRow = () => {
    if (dcaPrices.length <= 1) return;
    const nextIndex = dcaPrices.length - 1;
    setDcaPrices(dcaPrices.slice(0, nextIndex));
    setDcaMonthsCount(nextIndex);
  };

  // Advanced Carried Over Cash DCA Calculations
  let totalDcaLots = 0;
  let totalDcaSpent = 0;
  let accumulatedCash = 0;

  const dcaCalculationsByMonth = dcaPrices.map((row) => {
    const rPrice = row.price === "" ? 0 : row.price;
    const effectiveMonthlyBudget = dcaMonthlyBudget === "" ? 0 : dcaMonthlyBudget;
    const buyingPower = effectiveMonthlyBudget + accumulatedCash;
    const costPerLot = rPrice * 100;
    const lotsBought = costPerLot > 0 ? Math.floor(buyingPower / costPerLot) : 0;
    const spentThisMonth = lotsBought * costPerLot;
    accumulatedCash = buyingPower - spentThisMonth;
    
    totalDcaLots += lotsBought;
    totalDcaSpent += spentThisMonth;

    return {
      monthIndex: row.monthIndex,
      price: row.price,
      lotsBought,
      spent: spentThisMonth,
      leftover: accumulatedCash,
    };
  });

  const effectiveDcaMonthsCount = dcaMonthsCount === "" ? 0 : dcaMonthsCount;
  const effectiveDcaMonthlyBudget = dcaMonthlyBudget === "" ? 0 : dcaMonthlyBudget;
  const effectiveDcaYield = dcaYield === "" ? 0 : dcaYield;
  const effectiveDcaCurrentPrice = dcaCurrentPrice === "" ? 0 : dcaCurrentPrice;

  const totalInvestedFunds = effectiveDcaMonthsCount * effectiveDcaMonthlyBudget;
  const totalDcaShares = totalDcaLots * 100;
  // Calculate true average cost per acquired share
  const dcaAveragePrice = totalDcaShares > 0 ? totalDcaSpent / totalDcaShares : 0;
  // Annual dividend yield estimate based on average cost
  const dcaAnnualDividend = totalDcaShares * dcaAveragePrice * (effectiveDcaYield / 100);

  // Growth & Value calculations relative to average cost
  const dcaGrowthPercent = dcaAveragePrice > 0 ? ((effectiveDcaCurrentPrice - dcaAveragePrice) / dcaAveragePrice) * 100 : 0;
  const dcaTotalValue = totalDcaShares * effectiveDcaCurrentPrice;
  const dcaGainLoss = dcaTotalValue - totalDcaSpent;

  // =========================================================
  // 2. STATE & LOGIC: DIVIDEND CALCULATOR (DUAL INPUT SYNC)
  // =========================================================
  const [divLots, setDivLots] = useState<number | "">(50);
  const [divAvgBuyPrice, setDivAvgBuyPrice] = useState<number | "">(4000);
  const [divYieldPercent, setDivYieldPercent] = useState<number | "">(5.0);
  const [divDPS, setDivDPS] = useState<number | "">(200);

  // Handle changing dividend yield percent (re-calculate DPS)
  const handleYieldPercentChange = (val: number | "") => {
    setDivYieldPercent(val);
    if (val === "") {
      setDivDPS("");
    } else {
      const avgPrice = divAvgBuyPrice === "" ? 0 : divAvgBuyPrice;
      const calculatedDPS = (val / 100) * avgPrice;
      setDivDPS(parseFloat(calculatedDPS.toFixed(2)));
    }
  };

  // Handle changing DPS (re-calculate yield %)
  const handleDPSChange = (val: number | "") => {
    setDivDPS(val);
    if (val === "") {
      setDivYieldPercent("");
    } else {
      const avgPrice = divAvgBuyPrice === "" ? 0 : divAvgBuyPrice;
      const calculatedYield = avgPrice > 0 ? (val / avgPrice) * 100 : 0;
      setDivYieldPercent(parseFloat(calculatedYield.toFixed(2)));
    }
  };

  // Recalculate if AvgBuyPrice changes to keep yield and dps consistent
  const handleAvgBuyPriceChange = (val: number | "") => {
    setDivAvgBuyPrice(val);
    if (val === "" || val === 0) {
      setDivDPS("");
    } else {
      const yieldPercent = divYieldPercent === "" ? 0 : divYieldPercent;
      const calculatedDPS = (yieldPercent / 100) * val;
      setDivDPS(parseFloat(calculatedDPS.toFixed(2)));
    }
  };

  const effectiveDivLots = divLots === "" ? 0 : divLots;
  const effectiveDivAvgBuyPrice = divAvgBuyPrice === "" ? 0 : divAvgBuyPrice;
  const effectiveDivYieldPercent = divYieldPercent === "" ? 0 : divYieldPercent;
  const effectiveDivDPS = divDPS === "" ? 0 : divDPS;

  const totalDividendLots = effectiveDivLots;
  const totalDividendShares = effectiveDivLots * 100;
  const totalDividendCapital = totalDividendShares * effectiveDivAvgBuyPrice;
  const totalDividendPayout = totalDividendShares * effectiveDivDPS;

  // =========================================================
  // 3. STATE & LOGIC: MARGIN OF SAFETY (MoS)
  // =========================================================
  const [intrinsicValue, setIntrinsicValue] = useState<number | "">(6500);
  const [mosCurrentPrice, setMosCurrentPrice] = useState<number | "">(4500);

  const effectiveIntrinsicValue = intrinsicValue === "" ? 0 : intrinsicValue;
  const effectiveMosCurrentPrice = mosCurrentPrice === "" ? 0 : mosCurrentPrice;

  const mosPercent = effectiveIntrinsicValue > 0 ? ((effectiveIntrinsicValue - effectiveMosCurrentPrice) / effectiveIntrinsicValue) * 100 : 0;
  
  let mosStatus: "SANGAT_AMAN" | "WAJAR" | "OVERVALUED" = "WAJAR";
  let mosColor = "text-yellow-700 bg-yellow-50 border-yellow-200";
  let mosDescription = "Harga pasar di bawah harga wajar namun margin pengaman tipis. Lakukan riset tambahan.";

  if (mosPercent >= 30) {
    mosStatus = "SANGAT_AMAN";
    mosColor = "text-emerald-700 bg-emerald-50/50 border-emerald-200";
    mosDescription = "Harga pasar jauh di bawah harga wajar. Menawarkan tingkat perlindungan risiko (undervalued) yang sangat baik.";
  } else if (mosPercent < 0) {
    mosStatus = "OVERVALUED";
    mosColor = "text-rose-700 bg-rose-50/50 border-rose-200";
    mosDescription = "Harga pasar saat ini melebihi estimasi harga wajarnya. Berisiko tinggi mengalami koreksi harga.";
  }

  return (
    <div id="investing-tab-container" className="space-y-12">
      {/* ======================= SECTION 1: DCA WITH YIELD ======================= */}
      <section id="dca-section" className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Wallet className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">1. Kalkulator DCA (Dollar Cost Averaging) dengan Proyeksi Yield</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Simulasikan menabung saham bulanan secara konsisten dengan visualisasi sisa dana terakumulasi</p>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* DCA Inputs */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider border-b border-slate-200 pb-2">Konfigurasi Tabungan</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Dana Rutin Bulanan (Rp)</label>
                <input
                  type="number"
                  value={dcaMonthlyBudget}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDcaMonthlyBudget(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                  }}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Durasi (Bulan)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={dcaMonthsCount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDcaMonthsCount(val === "" ? "" : Math.max(1, Math.min(60, parseInt(val) || 1)));
                    }}
                    className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                  <div className="flex flex-col gap-1 shrink-0">
                    <button type="button" onClick={addDcaMonthRow} className="bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-0.5 text-[10px] font-extrabold rounded hover:bg-slate-200 cursor-pointer">+</button>
                    <button type="button" onClick={removeDcaMonthRow} className="bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-0.5 text-[10px] font-extrabold rounded hover:bg-slate-200 cursor-pointer">-</button>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Estimasi Yield Dividen (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={dcaYield}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDcaYield(val === "" ? "" : Math.max(0, parseFloat(val) || 0));
                    }}
                    className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg pl-3 pr-8 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">%</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Harga Saham Saat Ini (Rp)</label>
                <input
                  type="number"
                  value={dcaCurrentPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDcaCurrentPrice(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                  }}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Harga Saham Tiap Bulan (Dapat diubah secara spesifik):</span>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[220px] overflow-y-auto pr-1">
                {dcaPrices.map((row, index) => (
                  <div key={row.id} className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600">Bln {index + 1}:</span>
                    <input
                      type="number"
                      value={row.price}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDcaPriceRow(row.id, val === "" ? "" : Math.max(0, parseInt(val) || 0));
                      }}
                      className="w-2/3 bg-white border border-slate-200 text-slate-850 text-xs font-mono rounded-md px-1.5 py-1 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DCA Outputs */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-5">
              <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider border-b border-slate-200 pb-2">Proyeksi Hasil DCA</h3>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                <div className="bg-white p-2.5 sm:p-3.5 rounded-xl border border-slate-200 shadow-sm min-w-0 break-words">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold truncate">Total Dana Terinvestasi</span>
                  <span className="text-xs sm:text-sm md:text-base font-bold text-slate-800 font-mono block break-all">{formatRupiah(totalInvestedFunds)}</span>
                  <span className="block text-[9px] text-slate-400 mt-0.5 truncate">({dcaMonthsCount} bln × {formatRupiah(dcaMonthlyBudget)})</span>
                </div>

                <div className="bg-white p-2.5 sm:p-3.5 rounded-xl border border-slate-200 shadow-sm min-w-0 break-words">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold truncate">Total Saham Diperoleh</span>
                  <span className="text-xs sm:text-sm md:text-base font-bold text-emerald-600 font-mono block break-all">{formatNumber(totalDcaLots)} Lot</span>
                  <span className="block text-[9px] text-slate-400 mt-0.5 truncate">({formatNumber(totalDcaShares)} Lembar)</span>
                </div>

                <div className="bg-white p-2.5 sm:p-3.5 rounded-xl border border-slate-200 shadow-sm min-w-0 break-words">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold truncate">Rata-rata Harga</span>
                  <span className="text-xs sm:text-sm md:text-base font-bold text-indigo-600 font-mono block break-all">{formatRupiah(dcaAveragePrice, true)}</span>
                  <span className="block text-[9px] text-slate-400 mt-0.5 truncate">True dynamic cost</span>
                </div>

                <div className="bg-white p-2.5 sm:p-3.5 rounded-xl border border-slate-200 shadow-sm min-w-0 break-words">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold truncate">Sisa Kas Terakumulasi</span>
                  <span className="text-xs sm:text-sm md:text-base font-bold text-amber-700 font-mono block break-all">{formatRupiah(accumulatedCash)}</span>
                  <span className="block text-[9px] text-slate-400 mt-0.5 truncate">Sisa beli lot bulat</span>
                </div>

                <div className="bg-white p-2.5 sm:p-3.5 rounded-xl border border-slate-200 shadow-sm min-w-0 break-words">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold truncate">Total Nilai Saham</span>
                  <span className="text-xs sm:text-sm md:text-base font-bold text-emerald-600 font-mono block break-all">{formatRupiah(dcaTotalValue)}</span>
                  <span className="block text-[9px] text-slate-400 mt-0.5 break-all">({formatNumber(totalDcaShares)} Lbr × {formatRupiah(dcaCurrentPrice)})</span>
                </div>

                <div className={`p-2.5 sm:p-3.5 rounded-xl border shadow-sm min-w-0 break-words ${dcaGrowthPercent >= 0 ? 'bg-emerald-50/20 border-emerald-200' : 'bg-rose-50/20 border-rose-200'}`}>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold truncate">Pertumbuhan (Growth)</span>
                  <span className={`text-xs sm:text-sm md:text-base font-bold font-mono block break-all ${dcaGrowthPercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {dcaGrowthPercent >= 0 ? '+' : ''}{formatPercent(dcaGrowthPercent)}
                  </span>
                  <span className={`block text-[9px] font-semibold mt-0.5 break-all ${dcaGainLoss >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {dcaGainLoss >= 0 ? '+' : ''}{formatRupiah(dcaGainLoss)}
                  </span>
                </div>
              </div>

              {/* Annual dividend projection badge */}
              <div className="bg-gradient-to-r from-emerald-50 to-white border border-emerald-200 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-w-0 break-words">
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Proyeksi Dividen Pasif Tahunan</span>
                  <div className="text-sm sm:text-base md:text-lg font-extrabold text-slate-800 font-mono break-all">
                    {formatRupiah(dcaAnnualDividend)}
                  </div>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="block text-[9px] sm:text-[10px] text-slate-500 font-medium">Yield Tahunan</span>
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-750 bg-emerald-50 border border-emerald-200 py-0.5 px-2 rounded mt-0.5 inline-block font-mono">
                    {dcaYield}% per tahun
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

            {/* ======================= SECTION 2: DIVIDEND CALCULATOR (DUAL INPUT SYNC) ======================= */}

      <section id="dividend-section" className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Landmark className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">2. Kalkulator Dividen (Sinkronisasi Fleksibel)</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Hitung estimasi penerimaan dividen berdasarkan persentase Yield ATAU Dividend per Share (DPS) secara dua arah</p>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Inputs Panel */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider border-b border-slate-200 pb-2">Atur Kepemilikan &amp; Yield</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Jumlah Lot Kepemilikan</label>
                <input
                  type="number"
                  value={divLots}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDivLots(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                  }}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Harga Beli Rata-rata (Rp)</label>
                <input
                  type="number"
                  value={divAvgBuyPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleAvgBuyPriceChange(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                  }}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            {/* Dual synchronizing input panel */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
              <span className="block text-xs font-bold text-indigo-600 uppercase tracking-wider">Dual Synchronized Inputs (Pilih salah satu untuk diisi):</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Opsi A: Dividend Yield (%) per tahun</label>
                  <span className="block text-[10px] text-slate-400 mb-1.5 font-medium">Sistem akan otomatis menghitung DPS</span>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={divYieldPercent}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleYieldPercentChange(val === "" ? "" : Math.max(0, parseFloat(val) || 0));
                      }}
                      className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg pl-3 pr-8 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Opsi B: DPS (Rupiah per Lembar)</label>
                  <span className="block text-[10px] text-slate-400 mb-1.5 font-medium">Sistem akan otomatis menghitung Yield</span>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      value={divDPS}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleDPSChange(val === "" ? "" : Math.max(0, parseFloat(val) || 0));
                      }}
                      className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg pl-3 pr-8 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">Rp</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Outputs Panel */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider border-b border-slate-200 pb-2">Rangkuman Proyeksi Dividen</h3>

              <div className="space-y-3">
                <div className="flex justify-between text-xs py-1">
                  <span className="text-slate-500 font-medium">Total Modal Perolehan:</span>
                  <span className="text-slate-800 font-mono font-bold">{formatRupiah(totalDividendCapital)}</span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-slate-500 font-medium">Jumlah Saham Dimiliki:</span>
                  <span className="text-slate-800 font-mono font-medium">{formatNumber(totalDividendShares)} Lembar ({totalDividendLots} Lot)</span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-slate-500 font-medium">Dividend per Share (DPS):</span>
                  <span className="text-slate-800 font-mono font-medium">{formatRupiah(divDPS, true)} per Lembar</span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-slate-500 font-medium">Dividend Yield (on Cost):</span>
                  <span className="text-emerald-600 font-mono font-bold">{formatPercent(divYieldPercent)} per tahun</span>
                </div>

                <div className="border-t border-dashed border-slate-200 pt-3 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <span className="text-sm font-bold text-slate-700">Estimasi Total Dividen Diterima:</span>
                  <span className="text-xl font-extrabold text-emerald-600 font-mono">{formatRupiah(totalDividendPayout)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= SECTION 3: PORTFOLIO MARGIN OF SAFETY (MoS) ======================= */}
      <section id="mos-section" className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">3. Margin of Safety (MoS)</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Hitung batas pengaman harga beli terhadap estimasi harga intrinsik (wajar) saham Anda</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* MoS Inputs */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider border-b border-slate-200 pb-2">Analisis Nilai Saham</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Harga Wajar / Intrinsic Value (Rp)</label>
                <input
                  type="number"
                  value={intrinsicValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    setIntrinsicValue(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                  }}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Harga Pasar Saat Ini (Rp)</label>
                <input
                  type="number"
                  value={mosCurrentPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMosCurrentPrice(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                  }}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>
          </div>

          {/* MoS Outputs */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-5 min-w-0 break-words">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-slate-500">Persentase Margin of Safety (MoS)</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className={`text-2xl sm:text-3xl font-extrabold font-mono break-all ${mosPercent >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {mosPercent.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className={`border rounded-xl py-2 px-4 shrink-0 font-bold text-xs sm:text-sm ${
                  mosStatus === "SANGAT_AMAN"
                    ? "text-emerald-800 bg-emerald-50 border-emerald-200"
                    : mosStatus === "WAJAR"
                    ? "text-amber-800 bg-amber-50 border-amber-200"
                    : "text-rose-800 bg-rose-50 border-rose-200"
                }`}>
                  {mosStatus === "SANGAT_AMAN" && "✓ SANGAT AMAN (≥ 30%)"}
                  {mosStatus === "WAJAR" && "⚡ WAJAR (0 - 30%)"}
                  {mosStatus === "OVERVALUED" && "⚠ OVERVALUED (< 0%)"}
                </div>
              </div>

              {/* Description box */}
              <p className="text-xs text-slate-600 leading-relaxed bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200">
                {mosDescription}
              </p>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Makin Berisiko</span>
                  <span>Ideal (30% ke atas)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden border border-slate-300/40">
                  <div
                    className={`h-full transition-all duration-300 ${
                      mosStatus === "SANGAT_AMAN" ? "bg-emerald-500" : mosStatus === "WAJAR" ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${Math.max(0, Math.min(100, mosPercent))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
