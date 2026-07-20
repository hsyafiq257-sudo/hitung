/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Wallet, Landmark, ShieldCheck, AlertCircle, TrendingUp, Coins, Calculator, Percent, Download } from "lucide-react";
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
  // 2. STATE & LOGIC: COMPOUNDING SIMULATOR (WITH DRIP OPTION)
  // =========================================================
  const [compInitialModal, setCompInitialModal] = useState<number | "">(10000000);
  const [compMonthlyContribution, setCompMonthlyContribution] = useState<number | "">(1000000);
  const [compIncludeCapitalGain, setCompIncludeCapitalGain] = useState<boolean>(false);
  const [compCapitalGain, setCompCapitalGain] = useState<number | "">(7);
  const [compDividendYield, setCompDividendYield] = useState<number | "">(5);
  const [compReinvestDividends, setCompReinvestDividends] = useState<boolean>(true);
  const [compDurationYears, setCompDurationYears] = useState<number | "">(10);
  const [compFrequency, setCompFrequency] = useState<"monthly" | "yearly">("monthly");
  const [compHoveredIndex, setCompHoveredIndex] = useState<number | null>(null);
  const [compTaxDividends, setCompTaxDividends] = useState<boolean>(false);
  const [compInflation, setCompInflation] = useState<number | "">(3);

  const effCompInitial = compInitialModal === "" ? 0 : compInitialModal;
  const effCompMonthly = compMonthlyContribution === "" ? 0 : compMonthlyContribution;
  const effCapitalGain = compIncludeCapitalGain ? (compCapitalGain === "" ? 0 : compCapitalGain) : 0;
  const effDivYield = compDividendYield === "" ? 0 : compDividendYield;
  const effCompYears = compDurationYears === "" ? 0 : compDurationYears;
  const effInflation = compInflation === "" ? 0 : compInflation;

  let currentVal = effCompInitial;
  let currentDep = effCompInitial;
  let accumulatedCashDividends = 0;
  const compMilestones: { year: number; value: number; deposit: number; interestEarned: number; dividendEarned: number; accumDiv: number; inflationAdjustedValue: number }[] = [];

  const effDivYieldToUse = compTaxDividends ? effDivYield * 0.9 : effDivYield;

  for (let y = 1; y <= effCompYears; y++) {
    const rateToUse = compReinvestDividends ? (effCapitalGain + effDivYieldToUse) : effCapitalGain;
    const monthlyRate = (rateToUse / 100) / 12;

    if (compFrequency === "monthly") {
      for (let m = 1; m <= 12; m++) {
        currentVal = currentVal * (1 + monthlyRate) + effCompMonthly;
        currentDep += effCompMonthly;
      }
    } else {
      // Yearly: compound monthly, then add once at the end of the year
      for (let m = 1; m <= 12; m++) {
        currentVal = currentVal * (1 + monthlyRate);
      }
      currentVal += effCompMonthly;
      currentDep += effCompMonthly;
    }

    // Dividen dihitung di akhir tahun berdasarkan nilai portofolio akhir tahun tersebut dikali Dividend Yield % (bersih setelah pajak jika aktif)
    const annualDiv = currentVal * (effDivYieldToUse / 100);

    if (!compReinvestDividends) {
      accumulatedCashDividends += annualDiv;
    }

    const currentTotalWealth = currentVal + accumulatedCashDividends;
    const inflationFactor = Math.pow(1 + effInflation / 100, y);
    const inflationAdjustedVal = currentTotalWealth / inflationFactor;

    compMilestones.push({
      year: y,
      value: Math.round(currentVal),
      deposit: Math.round(currentDep),
      interestEarned: Math.round(currentVal - currentDep),
      dividendEarned: Math.round(annualDiv),
      accumDiv: Math.round(accumulatedCashDividends),
      inflationAdjustedValue: Math.round(inflationAdjustedVal),
    });
  }

  const finalValue = currentVal; // Total Nilai Portofolio (Saham)
  const finalDeposited = currentDep; // Total Modal Disetor
  const finalCashDividends = accumulatedCashDividends; // Total Kas Dividen
  const finalTotalWealth = finalValue + finalCashDividends; // Total Kekayaan Akhir
  const finalGain = finalTotalWealth - finalDeposited; // Total Keuntungan
  const finalInflationAdjusted = finalTotalWealth / Math.pow(1 + effInflation / 100, effCompYears);

  const handleExportReport = () => {
    if (compMilestones.length === 0) return;

    // CSV Header (Tahun, Modal Disetor, Dividen Didapat, Nilai Portofolio)
    const headers = [
      "Tahun",
      "Modal Disetor (IDR)",
      "Dividen Didapat Tahun Ini (IDR)",
      "Akumulasi Kas Dividen (IDR)",
      "Nilai Portofolio (IDR)",
      "Total Kekayaan (IDR)",
      "Nilai Riil Disesuaikan Inflasi (IDR)"
    ];

    const rows = compMilestones.map((ms) => [
      ms.year,
      ms.deposit,
      ms.dividendEarned,
      ms.accumDiv,
      ms.value,
      ms.value + ms.accumDiv,
      ms.inflationAdjustedValue
    ]);

    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `laporan_simulasi_compounding_${effCompYears}_tahun.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // =========================================================
  // 3. STATE & LOGIC: DIVIDEND CALCULATOR (DUAL INPUT SYNC)
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

      {/* ======================= SECTION 2: COMPOUNDING SIMULATOR ======================= */}
      <section id="compounding-section" className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Calculator className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">2. Kalkulator Simulasi Compounding (Bunga Berbunga)</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Simulasikan pertumbuhan dana investasi Anda secara eksponensial dengan opsi Reinvestasi Dividen (DRIP)</p>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Inputs Panel */}
          <div className="lg:col-span-5 space-y-5">
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider border-b border-slate-200 pb-2">Parameter Investasi</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Modal Awal (Rp)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-medium">Rp</span>
                  <input
                    type="number"
                    value={compInitialModal}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCompInitialModal(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                    }}
                    className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Tambahan Investasi Rutin (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-medium">Rp</span>
                    <input
                      type="number"
                      value={compMonthlyContribution}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCompMonthlyContribution(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                      }}
                      className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Frekuensi Setoran</label>
                  <select
                    value={compFrequency}
                    onChange={(e) => setCompFrequency(e.target.value as "monthly" | "yearly")}
                    className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 h-[38px] cursor-pointer"
                  >
                    <option value="monthly">Bulanan</option>
                    <option value="yearly">Tahunan</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2.5 select-none bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                <input
                  type="checkbox"
                  id="compIncludeCapitalGain"
                  checked={compIncludeCapitalGain}
                  onChange={(e) => setCompIncludeCapitalGain(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="compIncludeCapitalGain" className="text-[11px] font-bold text-slate-700 cursor-pointer uppercase leading-tight">
                  Sertakan Estimasi Kenaikan Harga (Capital Gain)?
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 leading-tight">Capital Gain Tahunan (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      disabled={!compIncludeCapitalGain}
                      value={compIncludeCapitalGain ? (compCapitalGain === "" ? "" : compCapitalGain) : 0}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCompCapitalGain(val === "" ? "" : Math.max(0, parseFloat(val) || 0));
                      }}
                      className={`w-full border rounded-lg pl-3 pr-8 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                        compIncludeCapitalGain 
                          ? "bg-white border-slate-200 text-slate-800" 
                          : "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 leading-tight">Dividend Yield Tahunan (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={compDividendYield}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCompDividendYield(val === "" ? "" : Math.max(0, parseFloat(val) || 0));
                      }}
                      className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg pl-3 pr-8 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Durasi (Tahun)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={compDurationYears}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCompDurationYears(val === "" ? "" : Math.max(1, Math.min(50, parseInt(val) || 1)));
                      }}
                      className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg pl-3 pr-14 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] text-slate-400 font-bold uppercase">Thn</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4 sm:mt-0 select-none bg-indigo-50/40 border border-indigo-100/50 p-2 rounded-xl">
                  <input
                    type="checkbox"
                    id="compReinvestDividends"
                    checked={compReinvestDividends}
                    onChange={(e) => setCompReinvestDividends(e.target.checked)}
                    className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="compReinvestDividends" className="text-[11px] font-bold text-slate-700 cursor-pointer uppercase leading-tight">
                    Reinvestasi Dividen (DRIP)
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Estimasi Inflasi Tahunan (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={compInflation}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCompInflation(val === "" ? "" : Math.max(0, parseFloat(val) || 0));
                      }}
                      className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg pl-3 pr-8 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">%</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4 sm:mt-0 select-none bg-red-50/40 border border-red-100/50 p-2 rounded-xl">
                  <input
                    type="checkbox"
                    id="compTaxDividends"
                    checked={compTaxDividends}
                    onChange={(e) => setCompTaxDividends(e.target.checked)}
                    className="w-4.5 h-4.5 text-red-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="compTaxDividends" className="text-[11px] font-bold text-slate-700 cursor-pointer uppercase leading-tight">
                    Potong Pajak Dividen (10%)?
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 p-3.5 rounded-xl flex items-start gap-2.5 text-[11px] text-indigo-800 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Kekuatan Compounding:</span> Semakin lama durasi investasi Anda, semakin besar porsi keuntungan (bunga majemuk) dibandingkan dengan akumulasi modal dasar yang Anda setorkan.
              </div>
            </div>
          </div>

          {/* Outputs Panel */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-2">
                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Rangkuman Akumulasi Masa Depan</h3>
                <button
                  onClick={handleExportReport}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all duration-200 border border-indigo-100 uppercase tracking-wider cursor-pointer shadow-sm hover:shadow active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Laporan (CSV)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                <div className="bg-gradient-to-br from-indigo-50/50 to-white p-3 rounded-xl border border-indigo-100 shadow-sm min-w-0">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold truncate">Portofolio (Saham)</span>
                  <span className="text-xs sm:text-sm font-extrabold text-indigo-700 font-mono block mt-1 break-all">
                    {formatRupiah(finalValue)}
                  </span>
                  <span className="block text-[9px] text-slate-400 mt-0.5 truncate">Pertumbuhan nilai saham</span>
                </div>

                <div className="bg-gradient-to-br from-emerald-50/40 to-white p-3 rounded-xl border border-emerald-100 shadow-sm min-w-0">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold truncate">Total Kas Dividen</span>
                  {compReinvestDividends ? (
                    <div>
                      <span className="text-xs font-bold text-slate-400 block mt-1">Rp 0</span>
                      <span className="block text-[9px] text-emerald-600 font-semibold mt-0.5 leading-tight">Digulung ke portofolio</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xs sm:text-sm font-extrabold text-emerald-600 font-mono block mt-1 break-all">
                        {formatRupiah(finalCashDividends)}
                      </span>
                      <span className="block text-[9px] text-slate-400 mt-0.5 truncate">Dividen tunai terpisah</span>
                    </div>
                  )}
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm min-w-0">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold truncate">Total Modal Disetor</span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-700 font-mono block mt-1 break-all">
                    {formatRupiah(finalDeposited)}
                  </span>
                  <span className="block text-[9px] text-slate-400 mt-0.5 truncate">Modal awal + rutin</span>
                </div>

                <div className="bg-gradient-to-br from-blue-50/50 to-white p-3 rounded-xl border border-blue-100 shadow-sm min-w-0">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold truncate">Kekayaan Akhir</span>
                  <span className="text-xs sm:text-sm font-extrabold text-blue-700 font-mono block mt-1 break-all">
                    {formatRupiah(finalTotalWealth)}
                  </span>
                  <span className="block text-[9px] text-blue-600 font-bold mt-0.5 truncate">
                    +{formatPercent(finalDeposited > 0 ? (finalGain / finalDeposited) * 100 : 0)} Net Growth
                  </span>
                </div>

                <div className="bg-gradient-to-br from-amber-50/50 to-white p-3 rounded-xl border border-amber-100 shadow-sm min-w-0">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold truncate">Nilai Riil (Inflasi)</span>
                  <span className="text-xs sm:text-sm font-extrabold text-amber-700 font-mono block mt-1 break-all">
                    {formatRupiah(finalInflationAdjusted)}
                  </span>
                  <span className="block text-[9px] text-amber-600 font-bold mt-0.5 truncate">
                    Daya beli masa depan
                  </span>
                </div>
              </div>

              {/* Visualisasi Grafik Pertumbuhan */}
              {compMilestones.length > 0 && (() => {
                const chartData = [
                  {
                    year: 0,
                    deposit: effCompInitial,
                    wealth: effCompInitial,
                  },
                  ...compMilestones.map((ms) => ({
                    year: ms.year,
                    deposit: ms.deposit,
                    wealth: ms.value + ms.accumDiv,
                  })),
                ];

                const maxVal = Math.max(...chartData.map(d => Math.max(d.deposit, d.wealth)), 100000);
                const yMax = maxVal * 1.1; // 10% headroom

                const paddingLeft = 55;
                const paddingRight = 15;
                const paddingTop = 15;
                const paddingBottom = 25;
                const chartWidth = 500 - paddingLeft - paddingRight;
                const chartHeight = 160; 
                const yBaseline = paddingTop + chartHeight;
                const stepX = chartWidth / (chartData.length - 1);

                const getX = (index: number) => paddingLeft + index * stepX;
                const getY = (val: number) => paddingTop + chartHeight - (val / yMax) * chartHeight;

                // Build paths
                let areaPath = "";
                let wealthLinePath = "";
                let depositLinePath = "";

                if (chartData.length > 0) {
                  // Area path for wealth (Area with gradient fill)
                  areaPath = `M ${getX(0)} ${yBaseline}`;
                  chartData.forEach((d, i) => {
                    areaPath += ` L ${getX(i)} ${getY(d.wealth)}`;
                  });
                  areaPath += ` L ${getX(chartData.length - 1)} ${yBaseline} Z`;

                  // Line path for wealth
                  wealthLinePath = `M ${getX(0)} ${getY(chartData[0].wealth)}`;
                  for (let i = 1; i < chartData.length; i++) {
                    wealthLinePath += ` L ${getX(i)} ${getY(chartData[i].wealth)}`;
                  }

                  // Line path for deposit
                  depositLinePath = `M ${getX(0)} ${getY(chartData[0].deposit)}`;
                  for (let i = 1; i < chartData.length; i++) {
                    depositLinePath += ` L ${getX(i)} ${getY(chartData[i].deposit)}`;
                  }
                }

                // Horizontal grid ticks (5 lines)
                const yTicks = [0, 0.25, 0.5, 0.75, 1];

                // Concise Y-Axis formatter
                const formatYLabelComp = (val: number) => {
                  if (val >= 1000000000) return `Rp ${(val / 1000000000).toFixed(1).replace(/\.0$/, "")}M`;
                  if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1).replace(/\.0$/, "")}Jt`;
                  if (val >= 1000) return `Rp ${(val / 1000).toFixed(0)}Rb`;
                  return `Rp ${val}`;
                };

                // Horizontal labels/Ticks
                // Show up to 6 labels on X axis to avoid overcrowding
                const xTicksIndices: number[] = [];
                if (chartData.length <= 6) {
                  for (let i = 0; i < chartData.length; i++) xTicksIndices.push(i);
                } else {
                  xTicksIndices.push(0);
                  const step = Math.ceil((chartData.length - 1) / 4);
                  for (let i = step; i < chartData.length - 1; i += step) {
                    xTicksIndices.push(i);
                  }
                  xTicksIndices.push(chartData.length - 1);
                }

                return (
                  <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm relative overflow-visible">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Grafik Pertumbuhan Investasi</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium leading-tight">Visualisasi proyeksi akumulasi modal vs total kekayaan dari tahun ke tahun</p>
                      </div>
                      {/* Legends */}
                      <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wide">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-1 bg-indigo-600 rounded-full inline-block"></span>
                          <span className="text-slate-600">Kekayaan Akhir</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-0.5 bg-slate-400 border-t border-dashed border-slate-400 inline-block"></span>
                          <span className="text-slate-600">Modal Disetor</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative w-full overflow-visible">
                      <svg viewBox="0 0 500 210" className="w-full h-auto overflow-visible select-none" onMouseLeave={() => setCompHoveredIndex(null)}>
                        <defs>
                          <linearGradient id="wealthAreaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.01" />
                          </linearGradient>
                        </defs>

                        {/* Horizontal Grid lines & Y Axis labels */}
                        {yTicks.map((tick, idx) => {
                          const yVal = tick * yMax;
                          const yPos = getY(yVal);
                          return (
                            <g key={idx}>
                              <line
                                x1={paddingLeft}
                                y1={yPos}
                                x2={paddingLeft + chartWidth}
                                y2={yPos}
                                stroke="#f1f5f9"
                                strokeWidth="1.5"
                                strokeDasharray={tick === 0 ? "none" : "3,3"}
                              />
                              <text
                                x={paddingLeft - 8}
                                y={yPos + 3}
                                textAnchor="end"
                                className="fill-slate-400 font-mono text-[9px] font-medium"
                              >
                                {formatYLabelComp(yVal)}
                              </text>
                            </g>
                          );
                        })}

                        {/* X-Axis base line */}
                        <line
                          x1={paddingLeft}
                          y1={yBaseline}
                          x2={paddingLeft + chartWidth}
                          y2={yBaseline}
                          stroke="#cbd5e1"
                          strokeWidth="1"
                        />

                        {/* X Axis Labels */}
                        {xTicksIndices.map((i) => {
                          const xPos = getX(i);
                          return (
                            <g key={i}>
                              <line
                                x1={xPos}
                                y1={yBaseline}
                                x2={xPos}
                                y2={yBaseline + 4}
                                stroke="#94a3b8"
                                strokeWidth="1"
                              />
                              <text
                                x={xPos}
                                y={yBaseline + 14}
                                textAnchor="middle"
                                className="fill-slate-400 font-mono text-[9px] font-medium"
                              >
                                Thn {chartData[i].year}
                              </text>
                            </g>
                          );
                        })}

                        {/* Filled Area for Wealth */}
                        <path d={areaPath} fill="url(#wealthAreaGradient)" />

                        {/* Wealth Line */}
                        <path d={wealthLinePath} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                        {/* Deposited Line */}
                        <path d={depositLinePath} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" strokeLinecap="round" strokeLinejoin="round" />

                        {/* Interactive Hover Zones */}
                        {chartData.map((d, i) => {
                          const x = getX(i);
                          return (
                            <rect
                              key={i}
                              x={x - stepX / 2}
                              y={paddingTop}
                              width={stepX}
                              height={chartHeight}
                              fill="transparent"
                              className="cursor-pointer"
                              onMouseEnter={() => setCompHoveredIndex(i)}
                              onMouseMove={() => setCompHoveredIndex(i)}
                            />
                          );
                        })}

                        {/* Hover indicators */}
                        {compHoveredIndex !== null && compHoveredIndex < chartData.length && (
                          <g pointerEvents="none">
                            <line
                              x1={getX(compHoveredIndex)}
                              y1={paddingTop}
                              x2={getX(compHoveredIndex)}
                              y2={yBaseline}
                              stroke="#6366f1"
                              strokeWidth="1.5"
                              strokeDasharray="2,2"
                            />
                            <circle
                              cx={getX(compHoveredIndex)}
                              cy={getY(chartData[compHoveredIndex].wealth)}
                              r="5"
                              fill="#4f46e5"
                              stroke="#ffffff"
                              strokeWidth="2"
                            />
                            <circle
                              cx={getX(compHoveredIndex)}
                              cy={getY(chartData[compHoveredIndex].deposit)}
                              r="5"
                              fill="#94a3b8"
                              stroke="#ffffff"
                              strokeWidth="2"
                            />
                          </g>
                        )}
                      </svg>

                      {/* Interactive HTML Tooltip inside relative container */}
                      {compHoveredIndex !== null && compHoveredIndex < chartData.length && (() => {
                        const isLeftHalf = compHoveredIndex < chartData.length / 2;
                        const tooltipStyle = isLeftHalf
                          ? { left: `calc(${(compHoveredIndex / (chartData.length - 1)) * 100}% + 12px)`, top: "10px" }
                          : { right: `calc(${100 - (compHoveredIndex / (chartData.length - 1)) * 100}% + 12px)`, top: "10px" };

                        return (
                          <div
                            className="absolute bg-slate-900/95 backdrop-blur-xs text-white p-2.5 rounded-lg shadow-xl border border-slate-700 pointer-events-none z-10 text-[10px] flex flex-col space-y-1 w-44 transition-all duration-100"
                            style={tooltipStyle}
                          >
                            <div className="font-extrabold border-b border-slate-800 pb-1 uppercase tracking-wider text-slate-400">
                              Tahun {chartData[compHoveredIndex].year}
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400">Kekayaan:</span>
                              <span className="font-bold text-indigo-300 font-mono">{formatRupiah(chartData[compHoveredIndex].wealth)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400">Modal Setor:</span>
                              <span className="font-bold text-slate-300 font-mono">{formatRupiah(chartData[compHoveredIndex].deposit)}</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-slate-800 pt-1">
                              <span className="text-emerald-400 font-bold">Keuntungan:</span>
                              <span className="font-bold text-emerald-400 font-mono">
                                {formatRupiah(chartData[compHoveredIndex].wealth - chartData[compHoveredIndex].deposit)}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })()}

              {/* Milestones Perkembangan */}
              {compMilestones.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Milestone Pertumbuhan Portofolio</span>
                    <span className="text-[10px] text-slate-400 font-medium">Berdasarkan tahun durasi</span>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto space-y-4 pr-1 scrollbar-none">
                    {compMilestones.map((ms) => (
                      <div key={ms.year} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                        {/* Header Kartu */}
                        <div className="flex justify-between items-center">
                          <h4 className="font-extrabold text-slate-800 text-sm font-sans">Tahun {ms.year}</h4>
                        </div>
                        {/* Garis pemisah tipis */}
                        <div className="border-t border-slate-100 my-2"></div>
                        {/* Isi Kartu */}
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-medium font-sans">Portofolio:</span>
                            <span className="font-bold text-slate-800 font-mono">{formatRupiah(ms.value)}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-medium font-sans">Dividen Tahun Ini:</span>
                            <span className="font-bold text-emerald-600 font-mono">{formatRupiah(ms.dividendEarned)}</span>
                          </div>
                          {effInflation > 0 && (
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500 font-medium font-sans">Nilai Riil (Sesuai Inflasi):</span>
                              <span className="font-bold text-amber-600 font-mono">{formatRupiah(ms.inflationAdjustedValue)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ======================= SECTION 3: DIVIDEND CALCULATOR (DUAL INPUT SYNC) ======================= */}
      <section id="dividend-section" className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Landmark className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">3. Kalkulator Dividen (Sinkronisasi Fleksibel)</h2>
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

      {/* ======================= SECTION 4: PORTFOLIO MARGIN OF SAFETY (MoS) ======================= */}
      <section id="mos-section" className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">4. Margin of Safety (MoS)</h2>
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
