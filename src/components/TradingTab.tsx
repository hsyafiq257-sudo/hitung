/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Plus, Trash2, ArrowUpDown, ShieldAlert, CheckCircle2, AlertTriangle, RefreshCw, Calculator, TrendingDown, TrendingUp } from "lucide-react";
import { formatRupiah, formatNumber, formatPercent, generateId } from "../utils";
import { AverageDownRow, AverageDownOutputs, RiskRewardInputs, RiskRewardOutputs } from "../types";

export default function TradingTab() {
  // ==========================================
  // 1. STATE & LOGIC: UNTUNG / RUGI BROKER FEE
  // ==========================================
  const [stockName, setStockName] = useState("BBRI");
  const [buyPrice, setBuyPrice] = useState<number | "">(5000);
  const [sellPrice, setSellPrice] = useState<number | "">(5500);
  const [lots, setLots] = useState<number | "">(10);
  const [buyFeePercent, setBuyFeePercent] = useState<number | "">(0.15);
  const [sellFeePercent, setSellFeePercent] = useState<number | "">(0.25);

  // Calculations for Broker fee calculator
  const effectiveBuyPrice = buyPrice === "" ? 0 : buyPrice;
  const effectiveSellPrice = sellPrice === "" ? 0 : sellPrice;
  const effectiveLots = lots === "" ? 0 : lots;
  const effectiveBuyFeePercent = buyFeePercent === "" ? 0 : buyFeePercent;
  const effectiveSellFeePercent = sellFeePercent === "" ? 0 : sellFeePercent;

  const totalBuyValue = effectiveBuyPrice * effectiveLots * 100;
  const buyFeeAmount = totalBuyValue * (effectiveBuyFeePercent / 100);
  const totalNetCapital = totalBuyValue + buyFeeAmount;

  const totalSellValue = effectiveSellPrice * effectiveLots * 100;
  const sellFeeAmount = totalSellValue * (effectiveSellFeePercent / 100);
  const totalNetProceeds = totalSellValue - sellFeeAmount;

  const profitCostNominal = totalNetProceeds - totalNetCapital;
  const profitCostPercent = totalNetCapital > 0 ? (profitCostNominal / totalNetCapital) * 100 : 0;
  const isProfit = profitCostNominal >= 0;

  // ==========================================
  // 2. STATE & LOGIC: AVERAGE DOWN
  // ==========================================
  const [avgDownRows, setAvgDownRows] = useState<AverageDownRow[]>([
    { id: generateId(), price: 5000, lots: 10 },
    { id: generateId(), price: 4500, lots: 15 },
  ]);

  const addAvgDownRow = () => {
    // Take the price of the last row as default, maybe a bit lower for "average down"
    const lastRow = avgDownRows[avgDownRows.length - 1];
    const defaultPrice = lastRow ? Math.max(100, lastRow.price - 200) : 1000;
    const defaultLots = lastRow ? lastRow.lots : 10;
    setAvgDownRows([...avgDownRows, { id: generateId(), price: defaultPrice, lots: defaultLots }]);
  };

  const deleteAvgDownRow = (id: string) => {
    if (avgDownRows.length <= 1) return; // keep at least 1 row
    setAvgDownRows(avgDownRows.filter((r) => r.id !== id));
  };

  const updateAvgDownRow = (id: string, field: "price" | "lots", value: number | "") => {
    setAvgDownRows(
      avgDownRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  // Calculation for average down
  let totalShares = 0;
  let totalCapital = 0;
  avgDownRows.forEach((row) => {
    const rPrice = row.price === "" ? 0 : row.price;
    const rLots = row.lots === "" ? 0 : row.lots;
    const shares = rLots * 100;
    totalShares += shares;
    totalCapital += rPrice * shares;
  });
  const totalLots = totalShares / 100;
  const averagePrice = totalShares > 0 ? totalCapital / totalShares : 0;

  // ==========================================
  // 3. STATE & LOGIC: RISK / REWARD RATIO
  // ==========================================
  const [entryPrice, setEntryPrice] = useState<number | "">(5000);
  const [takeProfit, setTakeProfit] = useState<number | "">(6000);
  const [stopLoss, setStopLoss] = useState<number | "">(4500);

  const effectiveEntryPrice = entryPrice === "" ? 0 : entryPrice;
  const effectiveTakeProfit = takeProfit === "" ? 0 : takeProfit;
  const effectiveStopLoss = stopLoss === "" ? 0 : stopLoss;

  const riskPerShare = effectiveEntryPrice - effectiveStopLoss;
  const rewardPerShare = effectiveTakeProfit - effectiveEntryPrice;

  let riskRewardRatioMultiplier = 0;
  let feasibilityStatus: "SANGAT_LAYAK" | "CUKUP_LAYAK" | "TIDAK_LAYAK" | "INVALID" = "INVALID";

  if (effectiveEntryPrice > 0 && riskPerShare > 0 && rewardPerShare > 0) {
    riskRewardRatioMultiplier = rewardPerShare / riskPerShare;
    if (riskRewardRatioMultiplier >= 2) {
      feasibilityStatus = "SANGAT_LAYAK";
    } else if (riskRewardRatioMultiplier >= 1) {
      feasibilityStatus = "CUKUP_LAYAK";
    } else {
      feasibilityStatus = "TIDAK_LAYAK";
    }
  } else {
    feasibilityStatus = "INVALID";
  }

  // ==========================================
  // 4. STATE & LOGIC: ESTIMASI ARA & ARB
  // ==========================================
  const [refPrice, setRefPrice] = useState<number | "">(1000);
  const [days, setDays] = useState<number | "">(1);

  interface ProjectionRow {
    day: number;
    araPrice: number;
    arbPrice: number;
    araPercent: number;
    arbPercent: number;
  }

  const getMultiDayProjections = (price: number | "", daysInput: number | ""): ProjectionRow[] => {
    if (
      price === "" ||
      price <= 0 ||
      isNaN(Number(price)) ||
      daysInput === "" ||
      daysInput <= 0 ||
      isNaN(Number(daysInput))
    ) {
      return [];
    }
    const limitDays = Math.min(30, Math.max(1, Number(daysInput)));
    
    const getTickSize = (p: number): number => {
      if (p < 200) return 1;
      if (p < 500) return 2;
      if (p < 2000) return 5;
      if (p < 5000) return 10;
      return 25;
    };

    const getPercentage = (p: number): number => {
      if (p <= 200) return 0.35;
      if (p <= 5000) return 0.25;
      return 0.20;
    };

    const projectionsList: ProjectionRow[] = [];
    let currentAraPrice = price;
    let currentArbPrice = price;

    for (let i = 1; i <= limitDays; i++) {
      // Calculate ARA step
      const araPct = getPercentage(currentAraPrice);
      const rawAra = currentAraPrice * (1 + araPct);
      const tickSizeAra = getTickSize(rawAra);
      const nextAra = Math.floor(rawAra / tickSizeAra) * tickSizeAra;

      // Calculate ARB step
      const arbPct = getPercentage(currentArbPrice);
      const rawArb = currentArbPrice * (1 - arbPct);
      const tickSizeArb = getTickSize(rawArb);
      let nextArb = Math.ceil(rawArb / tickSizeArb) * tickSizeArb;
      if (nextArb < 50) {
        nextArb = 50;
      }

      projectionsList.push({
        day: i,
        araPrice: nextAra,
        arbPrice: nextArb,
        araPercent: Number((araPct * 100).toFixed(1)),
        arbPercent: Number((arbPct * 100).toFixed(1)),
      });

      currentAraPrice = nextAra;
      currentArbPrice = nextArb;
    }

    return projectionsList;
  };

  const effectiveRefPrice = refPrice === "" ? 0 : refPrice;
  const projections = getMultiDayProjections(effectiveRefPrice, days);

  const araArbData = projections.length > 0 ? {
    ara: projections[0].araPrice,
    arb: projections[0].arbPrice,
    percent: projections[0].araPercent,
    tickSize: (() => {
      if (effectiveRefPrice < 200) return 1;
      if (effectiveRefPrice < 500) return 2;
      if (effectiveRefPrice < 2000) return 5;
      if (effectiveRefPrice < 5000) return 10;
      return 25;
    })()
  } : { ara: 0, arb: 0, percent: 0, tickSize: 0 };

  return (
    <div id="trading-tab-container" className="space-y-12">
      {/* ======================= SECTION 1: UNTUNG/RUGI CALCULATOR ======================= */}
      <section id="untung-rugi-section" className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-555 bg-indigo-50 rounded-lg">
              <Calculator className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">1. Kalkulator Untung / Rugi Saham</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Hitung estimasi profit bersih setelah dikurangi fee transaksi beli &amp; jual broker</p>
            </div>
          </div>
          <span className="hidden sm:inline-block text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-mono font-semibold">
            IDR Market Rounding
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Inputs Panel */}
          <div className="lg:col-span-5 space-y-5">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Nama Saham / Emiten</label>
                <input
                  type="text"
                  value={stockName}
                  onChange={(e) => setStockName(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-semibold"
                  placeholder="Contoh: BBRI atau TLKM"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Harga Beli (Rp)</label>
                  <input
                    type="number"
                    value={buyPrice}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBuyPrice(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                    }}
                    className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    value={sellPrice}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSellPrice(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                    }}
                    className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Jumlah Lot (1 Lot = 100 Lembar)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={lots}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLots(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                    }}
                    className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                  <div className="shrink-0 bg-slate-100 border border-slate-200 text-slate-600 text-xs px-3 py-2 rounded-lg font-mono font-medium">
                    = {formatNumber(effectiveLots * 100)} Lembar
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Fee Beli (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={buyFeePercent}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBuyFeePercent(val === "" ? "" : Math.max(0, parseFloat(val) || 0));
                      }}
                      className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg pl-3.5 pr-8 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Fee Jual (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={sellFeePercent}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSellFeePercent(val === "" ? "" : Math.max(0, parseFloat(val) || 0));
                      }}
                      className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg pl-3.5 pr-8 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Outputs Panel */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Buy Side Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Sisi Pembelian</span>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 font-mono font-bold">Beli</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Nilai Bersih Saham:</span>
                    <span className="text-slate-800 font-semibold font-mono">{formatRupiah(totalBuyValue)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Fee Beli ({buyFeePercent}%):</span>
                    <span className="text-slate-600 font-mono">+{formatRupiah(buyFeeAmount)}</span>
                  </div>
                  <div className="border-t border-dashed border-slate-200 pt-2 flex justify-between text-sm">
                    <span className="font-semibold text-slate-700">Total Modal Bersih:</span>
                    <span className="font-bold text-indigo-600 font-mono">{formatRupiah(totalNetCapital)}</span>
                  </div>
                </div>
              </div>

              {/* Sell Side Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Sisi Penjualan</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100 font-mono font-bold">Jual</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Nilai Bersih Saham:</span>
                    <span className="text-slate-800 font-semibold font-mono">{formatRupiah(totalSellValue)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Fee Jual ({sellFeePercent}%):</span>
                    <span className="text-slate-600 font-mono">-{formatRupiah(sellFeeAmount)}</span>
                  </div>
                  <div className="border-t border-dashed border-slate-200 pt-2 flex justify-between text-sm">
                    <span className="font-semibold text-slate-700">Hasil Jual Bersih:</span>
                    <span className="font-bold text-emerald-600 font-mono">{formatRupiah(totalNetProceeds)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profit Loss Summary Dashboard */}
            <div className={`rounded-xl border p-6 flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300 ${
              isProfit 
                ? "bg-gradient-to-r from-emerald-50 to-white border-emerald-200" 
                : "bg-gradient-to-r from-rose-50 to-white border-rose-200"
            }`}>
              <div className="space-y-1.5 text-center md:text-left">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hasil Akhir Trading</span>
                <div className="flex items-baseline justify-center md:justify-start gap-2.5">
                  <span className={`text-2xl md:text-3xl font-extrabold tracking-tight font-mono ${isProfit ? "text-emerald-600" : "text-rose-600"}`}>
                    {isProfit ? "+" : ""}{formatRupiah(profitCostNominal)}
                  </span>
                  <span className={`text-sm md:text-base font-bold px-2 py-0.5 rounded-md font-mono ${
                    isProfit ? "bg-emerald-100 text-emerald-700 border border-emerald-200/50" : "bg-rose-100 text-rose-700 border border-rose-200/50"
                  }`}>
                    {isProfit ? "▲" : "▼"} {formatPercent(profitCostPercent)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isProfit ? (
                  <div className="p-3 bg-emerald-100 rounded-full border border-emerald-200/50">
                    <TrendingUp className="w-8 h-8 text-emerald-600" />
                  </div>
                ) : (
                  <div className="p-3 bg-rose-100 rounded-full border border-rose-200/50">
                    <TrendingDown className="w-8 h-8 text-rose-600" />
                  </div>
                )}
              </div>
            </div>

            {/* Custom transaction summary box */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600 leading-relaxed font-sans">
              <span className="font-bold text-slate-800">Ringkasan Transaksi:</span> Transaksi saham <span className="text-indigo-600 font-bold">{stockName || "Saham"}</span> dengan akumulasi tarif total fee beli <span className="font-mono font-semibold">{buyFeePercent || 0}%</span> dan fee jual <span className="font-mono font-semibold">{sellFeePercent || 0}%</span>. Pembelian sebanyak <span className="font-bold text-slate-800">{lots || 0} Lot</span> pada harga <span className="font-mono font-bold text-slate-800">{formatRupiah(effectiveBuyPrice)}</span> memerlukan total modal bersih <span className="font-mono text-indigo-600 font-bold">{formatRupiah(totalNetCapital)}</span>. Jika seluruh unit dijual kembali pada harga <span className="font-mono text-slate-800">{formatRupiah(effectiveSellPrice)}</span>, hasil bersih yang dicairkan adalah <span className="font-mono text-emerald-600 font-bold">{formatRupiah(totalNetProceeds)}</span>, sehingga menghasilkan {isProfit ? <span className="text-emerald-600 font-extrabold">PROFIT BERSIH</span> : <span className="text-rose-600 font-extrabold">KERUGIAN BERSIH</span>} sebesar <span className={`font-mono font-extrabold ${isProfit ? "text-emerald-600" : "text-rose-600"}`}>{formatRupiah(profitCostNominal)}</span> ({formatPercent(profitCostPercent)}).
            </div>
          </div>
        </div>
      </section>

      {/* ======================= SECTION 2: AVERAGE DOWN CALCULATOR ======================= */}
      <section id="average-down-section" className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <ArrowUpDown className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">2. Kalkulator Average Down</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Hitung rata-rata harga beli baru dan akumulasi modal setelah beberapa kali melakukan pembelian bertahap</p>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left panel: Dynamic Rows */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Riwayat Pembelian Saham</span>
              <button
                type="button"
                onClick={addAvgDownRow}
                className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Tambah Baris Pembelian
              </button>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {avgDownRows.map((row, index) => (
                <div
                  key={row.id}
                  className="bg-slate-50 border border-slate-200 hover:border-slate-300 p-4 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-4 transition-all"
                >
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                      {index + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">Pembelian #{index + 1}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 flex-1">
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-bold">Harga Beli (Rp)</span>
                      <input
                        type="number"
                        value={row.price}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateAvgDownRow(row.id, "price", val === "" ? "" : Math.max(0, parseInt(val) || 0));
                        }}
                        className="w-full bg-white border border-slate-200 text-slate-800 text-sm font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        placeholder="Harga"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-bold">Jumlah Lot</span>
                      <input
                        type="number"
                        value={row.lots}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateAvgDownRow(row.id, "lots", val === "" ? "" : Math.max(0, parseInt(val) || 0));
                        }}
                        className="w-full bg-white border border-slate-200 text-slate-800 text-sm font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        placeholder="Lot"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-start gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                    <div className="text-right sm:text-left shrink-0">
                      <span className="block text-[9px] text-slate-500 uppercase tracking-wider font-bold">Subtotal Modal</span>
                      <span className="text-xs font-bold text-slate-800 font-mono">
                        {formatRupiah((row.price === "" ? 0 : row.price) * (row.lots === "" ? 0 : row.lots) * 100)}
                      </span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => deleteAvgDownRow(row.id)}
                      disabled={avgDownRows.length <= 1}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        avgDownRows.length <= 1
                          ? "opacity-40 border-slate-200 text-slate-400 cursor-not-allowed"
                          : "border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
                      }`}
                      title="Hapus baris ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel: Summary Output */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-6">
              <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider border-b border-slate-200 pb-2">Rangkuman Hasil Kalkulasi</h3>

              <div className="space-y-4">
                {/* Result Card: Average Price */}
                <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
                  <div>
                    <span className="block text-xs font-bold text-slate-500">Rata-rata Harga Baru</span>
                    <span className="text-xs text-slate-400 font-medium">Average Buy Price</span>
                  </div>
                  <span className="text-xl font-bold font-mono text-indigo-600">
                    {formatRupiah(averagePrice, true)}
                  </span>
                </div>

                {/* Result Card: Total Lots */}
                <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
                  <div>
                    <span className="block text-xs font-bold text-slate-500">Total Lot yang Dimiliki</span>
                    <span className="text-[10px] text-slate-400 font-mono">({formatNumber(totalShares)} Lembar)</span>
                  </div>
                  <span className="text-lg font-bold font-mono text-slate-800">
                    {formatNumber(totalLots)} Lot
                  </span>
                </div>

                {/* Result Card: Total Capital */}
                <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
                  <div>
                    <span className="block text-xs font-bold text-slate-500">Total Modal Keluar</span>
                    <span className="text-xs text-slate-400 font-medium">Excluding broker fees</span>
                  </div>
                  <span className="text-lg font-bold font-mono text-emerald-600">
                    {formatRupiah(totalCapital)}
                  </span>
                </div>
              </div>

              {/* Tips for Averaging Down */}
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-xs text-slate-700 leading-relaxed flex gap-3">
                <ShieldAlert className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 block mb-0.5">Strategi Average Down:</span>
                  Melakukan pembelian di harga bawah untuk memperkecil rata-rata modal ideal dilakukan hanya jika fundamental emiten kokoh, bukan karena kepanikan semata (menangkap pisau jatuh).
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= SECTION 3: RISK REWARD RATIO ======================= */}
      <section id="risk-reward-section" className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <ShieldAlert className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">3. Kalkulator Risk / Reward Ratio</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Analisis rasio perbandingan antara potensi keuntungan (Reward) dan batas kerugian (Risk) sebelum melakukan entri posisi</p>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Inputs */}
          <div className="lg:col-span-5 space-y-5">
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider border-b border-slate-200 pb-2">Trading Plan Setup</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Harga Beli / Entry Price (Rp)</label>
                <input
                  type="number"
                  value={entryPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEntryPrice(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                  }}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Target Keuntungan / Take Profit (Rp)</label>
                <input
                  type="number"
                  value={takeProfit}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTakeProfit(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                  }}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Batas Rugi / Stop Loss (Rp)</label>
                <input
                  type="number"
                  value={stopLoss}
                  onChange={(e) => {
                    const val = e.target.value;
                    setStopLoss(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                  }}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>
          </div>

          {/* Outputs */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            {/* Analysis Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Risk details */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">POTENSI PENURUNAN (RISK)</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold font-mono text-rose-600">
                    {riskPerShare > 0 ? formatRupiah(riskPerShare) : "Rp 0"}
                  </span>
                  {entryPrice > 0 && riskPerShare > 0 && (
                    <span className="text-xs text-rose-500 font-mono font-bold">
                      (-{formatPercent((riskPerShare / entryPrice) * 100)})
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">Maksimal kerugian per lembar jika menyentuh batas Stop Loss</p>
              </div>

              {/* Reward details */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">POTENSI KENAIKAN (REWARD)</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold font-mono text-emerald-600">
                    {rewardPerShare > 0 ? formatRupiah(rewardPerShare) : "Rp 0"}
                  </span>
                  {entryPrice > 0 && rewardPerShare > 0 && (
                    <span className="text-xs text-emerald-600 font-mono font-bold">
                      (+{formatPercent((rewardPerShare / entryPrice) * 100)})
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">Maksimal profit per lembar jika menyentuh target Take Profit</p>
              </div>
            </div>

            {/* Ratio Output */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="block text-xs font-bold text-slate-500">Risk : Reward Ratio</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-extrabold font-mono text-indigo-600">
                      1 : {riskRewardRatioMultiplier > 0 ? riskRewardRatioMultiplier.toFixed(2) : "0"}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      (Banding {riskRewardRatioMultiplier > 0 ? `1 banding ${riskRewardRatioMultiplier.toFixed(1)}` : "-"})
                    </span>
                  </div>
                </div>

                {/* Feasibility status badge */}
                <div className="w-full sm:w-auto">
                  {feasibilityStatus === "SANGAT_LAYAK" && (
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 py-2 px-4 rounded-xl">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-xs font-bold block leading-none">Rasio Sangat Layak</span>
                        <span className="text-[10px] text-emerald-600/90 mt-1 block font-medium">Reward ≥ 2x Lipat Risk (Ideal)</span>
                      </div>
                    </div>
                  )}

                  {feasibilityStatus === "CUKUP_LAYAK" && (
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 py-2 px-4 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                      <div>
                        <span className="text-xs font-bold block leading-none">Rasio Cukup Layak</span>
                        <span className="text-[10px] text-amber-700/90 mt-1 block font-medium">Reward setara/melebihi Risk (1:1 s/d 1:2)</span>
                      </div>
                    </div>
                  )}

                  {feasibilityStatus === "TIDAK_LAYAK" && (
                    <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 py-2 px-4 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                      <div>
                        <span className="text-xs font-bold block leading-none">Rasio Terlalu Berisiko</span>
                        <span className="text-[10px] text-rose-600/90 mt-1 block font-medium">Potensi kerugian melebihi target untung</span>
                      </div>
                    </div>
                  )}

                  {feasibilityStatus === "INVALID" && (
                    <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-500 py-2 px-4 rounded-xl">
                      <ShieldAlert className="w-5 h-5 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-xs font-bold block leading-none">Data Belum Valid</span>
                        <span className="text-[10px] text-slate-500 mt-1 block font-medium">SL harus di bawah harga beli &amp; TP harus di atas</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress visualizer of Risk : Reward */}
              {riskRewardRatioMultiplier > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>RISK (1)</span>
                    <span>REWARD ({riskRewardRatioMultiplier.toFixed(2)})</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex">
                    <div className="bg-rose-500 h-full transition-all" style={{ width: `${100 / (1 + riskRewardRatioMultiplier)}%` }} />
                    <div className="bg-emerald-500 h-full transition-all flex-1" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ======================= SECTION 4: KALKULATOR ESTIMASI ARA & ARB ======================= */}
      <section id="ara-arb-section" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
        <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg">
              <ArrowUpDown className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">4. Kalkulator Estimasi ARA &amp; ARB (Compounding)</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Estimasi batasan harga Auto Reject Atas (ARA) dan Auto Reject Bawah (ARB) simetris Bursa Efek Indonesia (BEI) beruntun</p>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Inputs Panel */}
          <div className="lg:col-span-5 space-y-5">
            <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">Acuan Harga &amp; Durasi</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Harga Acuan / Previous Close (Rp)</label>
                <input
                  type="number"
                  value={refPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setRefPrice("");
                    } else {
                      const parsed = parseInt(val);
                      setRefPrice(isNaN(parsed) ? "" : Math.max(0, parsed));
                    }
                  }}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="Contoh: 1000"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Estimasi Berapa Hari / Kali (Max 30)</label>
                <input
                  type="number"
                  value={days}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setDays("");
                    } else {
                      const parsed = parseInt(val);
                      setDays(isNaN(parsed) ? "" : Math.max(0, parsed));
                    }
                  }}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="Contoh: 1"
                />
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 block font-medium">Pilih durasi &gt; 1 hari untuk menampilkan simulasi tabel beruntun (compound).</span>
              </div>

              {/* BEI Symmetric Auto Rejection Rules Reference */}
              <div className="bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-950/30 p-4 rounded-xl space-y-2.5 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">Panduan Batasan Auto Rejection (BEI):</span>
                <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Rp50 - Rp200:</span>
                    <span className="font-bold">±35%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rp201 - Rp5.000:</span>
                    <span className="font-bold">±25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>&gt; Rp5.000:</span>
                    <span className="font-bold">±20%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Outputs Panel */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4 w-full">
              <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">Hasil Estimasi</h3>
              
              {days === "" || Number(days) <= 1 ? (
                /* Standard Layout for 1 Day */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* ARA Card */}
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 p-5 rounded-xl space-y-2 text-left relative overflow-hidden transition-colors">
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">POTENSI MAKSIMAL (ARA)</span>
                      <div>
                        <span className="text-2xl font-extrabold font-mono text-emerald-800 dark:text-emerald-300">
                          {refPrice && araArbData.ara > 0 ? formatRupiah(araArbData.ara) : "Rp 0"}
                        </span>
                        {refPrice && araArbData.ara > 0 && (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold block mt-1">
                            Harga ARA (+{araArbData.percent}%)
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-emerald-600/90 dark:text-emerald-500/90 leading-normal">
                        Batas atas penolakan penawaran otomatis oleh sistem JATS.
                      </p>
                      <TrendingUp className="absolute bottom-2 right-2 w-12 h-12 text-emerald-500/10 dark:text-emerald-400/5" />
                    </div>

                    {/* ARB Card */}
                    <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-5 rounded-xl space-y-2 text-left relative overflow-hidden transition-colors">
                      <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">BATAS MINIMAL (ARB)</span>
                      <div>
                        <span className="text-2xl font-extrabold font-mono text-rose-800 dark:text-rose-300">
                          {refPrice && araArbData.arb > 0 ? formatRupiah(araArbData.arb) : "Rp 0"}
                        </span>
                        {refPrice && araArbData.arb > 0 && (
                          <span className="text-xs text-rose-600 dark:text-rose-400 font-bold block mt-1">
                            Harga ARB (-{araArbData.percent}%)
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-rose-600/90 dark:text-rose-500/90 leading-normal">
                        Batas bawah penolakan penawaran otomatis oleh sistem JATS.
                      </p>
                      <TrendingDown className="absolute bottom-2 right-2 w-12 h-12 text-rose-500/10 dark:text-rose-400/5" />
                    </div>
                  </div>

                  {/* Status and Fraction Information */}
                  <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      Fraksi Harga: <strong className="text-slate-800 dark:text-slate-200 font-bold">±{araArbData.percent}%</strong>
                    </span>
                    {refPrice && refPrice > 0 && (
                      <span className="text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        Tick Size Acuan: Rp {araArbData.tickSize}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                /* Multi-Day Compounding Layout */
                <div className="space-y-4">
                  {/* Info Badge */}
                  <div className="bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-950/30 rounded-xl p-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Menampilkan simulasi perulangan hingga <strong>{days} hari kerja</strong>. Batas persentase auto rejection dan fraksi kelipatan harga (tick size) dihitung ulang secara dinamis mengikuti level harga pada tiap harinya.
                  </div>

                  {/* Highlighting Cards for Day N (Final Result) */}
                  {projections.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Final Day ARA Card */}
                      <div className="bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-900/40 p-4 rounded-xl flex items-center justify-between shadow-sm">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">Target ARA Hari ke-{days} (Akhir)</span>
                          <span className="text-xl font-extrabold font-mono text-emerald-800 dark:text-emerald-300">
                            {formatRupiah(projections[projections.length - 1].araPrice)}
                          </span>
                        </div>
                        <TrendingUp className="w-8 h-8 text-emerald-600/20 dark:text-emerald-400/20" />
                      </div>

                      {/* Final Day ARB Card */}
                      <div className="bg-rose-50/80 dark:bg-rose-950/20 border border-rose-300 dark:border-rose-900/40 p-4 rounded-xl flex items-center justify-between shadow-sm">
                        <div>
                          <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">Target ARB Hari ke-{days} (Akhir)</span>
                          <span className="text-xl font-extrabold font-mono text-rose-800 dark:text-rose-300">
                            {formatRupiah(projections[projections.length - 1].arbPrice)}
                          </span>
                        </div>
                        <TrendingDown className="w-8 h-8 text-rose-600/20 dark:text-rose-400/20" />
                      </div>
                    </div>
                  )}

                  {/* Scrollable Table View */}
                  <div className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm bg-white dark:bg-slate-900">
                    <div className="max-h-[300px] overflow-y-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-10">
                          <tr className="text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">
                            <th className="p-3 text-center">Hari Ke-</th>
                            <th className="p-3 text-right">Proyeksi Harga ARA</th>
                            <th className="p-3 text-right">Proyeksi Harga ARB</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                          {projections.map((row) => {
                            const isLast = row.day === days;
                            return (
                              <tr
                                key={row.day}
                                className={`transition-colors ${
                                  isLast
                                    ? "bg-indigo-50/70 dark:bg-indigo-950/30 text-slate-900 dark:text-slate-100 border-l-4 border-indigo-500"
                                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
                                }`}
                              >
                                <td className="p-3 text-center">
                                  {isLast ? (
                                    <span className="inline-flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 font-bold px-2.5 py-1 rounded text-[10px] uppercase tracking-wide">
                                      Hari ke-{row.day} (Akhir)
                                    </span>
                                  ) : (
                                    <span className="font-semibold text-slate-500 dark:text-slate-400">Hari {row.day}</span>
                                  )}
                                </td>
                                <td className={`p-3 text-right ${isLast ? "text-emerald-700 dark:text-emerald-400 font-extrabold text-sm" : "text-emerald-600/90 dark:text-emerald-500/80 font-medium"}`}>
                                  {formatRupiah(row.araPrice)} <span className="text-[10px] font-sans font-semibold text-slate-400 dark:text-slate-500 ml-1">(+{row.araPercent}%)</span>
                                </td>
                                <td className={`p-3 text-right ${isLast ? "text-rose-700 dark:text-rose-400 font-extrabold text-sm" : "text-rose-600/90 dark:text-rose-500/80 font-medium"}`}>
                                  {formatRupiah(row.arbPrice)} <span className="text-[10px] font-sans font-semibold text-slate-400 dark:text-slate-500 ml-1">(-{row.arbPercent}%)</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
