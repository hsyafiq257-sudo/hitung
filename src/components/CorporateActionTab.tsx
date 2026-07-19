/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Landmark, ArrowRightLeft, Scale, BadgeAlert, AlertCircle, Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import { formatRupiah, formatNumber, formatPercent } from "../utils";

export default function CorporateActionTab() {
  // ==========================================
  // 1. STATE & LOGIC: RIGHT ISSUE (HMETD)
  // ==========================================
  const [riCumPrice, setRiCumPrice] = useState<number | "">(3000);
  const [riExercisePrice, setRiExercisePrice] = useState<number | "">(2500);
  const [riOldRatio, setRiOldRatio] = useState<number | "">(4);
  const [riNewRatio, setRiNewRatio] = useState<number | "">(1);

  const effectiveRiCumPrice = riCumPrice === "" ? 0 : riCumPrice;
  const effectiveRiExercisePrice = riExercisePrice === "" ? 0 : riExercisePrice;
  const effectiveRiOldRatio = riOldRatio === "" ? 0 : riOldRatio;
  const effectiveRiNewRatio = riNewRatio === "" ? 0 : riNewRatio;

  // Theoretical ex-date price calculation
  const totalOldVal = effectiveRiCumPrice * effectiveRiOldRatio;
  const totalNewVal = effectiveRiExercisePrice * effectiveRiNewRatio;
  const riTheoreticalPrice = (effectiveRiOldRatio + effectiveRiNewRatio) > 0 
    ? (totalOldVal + totalNewVal) / (effectiveRiOldRatio + effectiveRiNewRatio) 
    : 0;
  
  const riAdjustmentPercent = effectiveRiCumPrice > 0 
    ? ((riTheoreticalPrice - effectiveRiCumPrice) / effectiveRiCumPrice) * 100 
    : 0;

  // ==========================================
  // 2. STATE & LOGIC: STOCK SPLIT
  // ==========================================
  const [ssCurrentPrice, setSsCurrentPrice] = useState<number | "">(10000);
  const [ssLots, setSsLots] = useState<number | "">(10);
  const [ssRatioOld, setSsRatioOld] = useState<number | "">(1);
  const [ssRatioNew, setSsRatioNew] = useState<number | "">(5);

  const effectiveSsCurrentPrice = ssCurrentPrice === "" ? 0 : ssCurrentPrice;
  const effectiveSsLots = ssLots === "" ? 0 : ssLots;
  const effectiveSsRatioOld = ssRatioOld === "" ? 0 : ssRatioOld;
  const effectiveSsRatioNew = ssRatioNew === "" ? 0 : ssRatioNew;

  const ssNewPrice = effectiveSsRatioNew > 0 ? effectiveSsCurrentPrice * (effectiveSsRatioOld / effectiveSsRatioNew) : 0;
  const ssNewLots = effectiveSsRatioOld > 0 ? effectiveSsLots * (effectiveSsRatioNew / effectiveSsRatioOld) : 0;
  const ssPortfolioValue = effectiveSsCurrentPrice * effectiveSsLots * 100;

  // ==========================================
  // 3. STATE & LOGIC: REVERSE SPLIT
  // ==========================================
  const [rsCurrentPrice, setRsCurrentPrice] = useState<number | "">(100);
  const [rsLots, setRsLots] = useState<number | "">(500);
  const [rsRatioOld, setRsRatioOld] = useState<number | "">(10);
  const [rsRatioNew, setRsRatioNew] = useState<number | "">(1);

  const effectiveRsCurrentPrice = rsCurrentPrice === "" ? 0 : rsCurrentPrice;
  const effectiveRsLots = rsLots === "" ? 0 : rsLots;
  const effectiveRsRatioOld = rsRatioOld === "" ? 0 : rsRatioOld;
  const effectiveRsRatioNew = rsRatioNew === "" ? 0 : rsRatioNew;

  const rsNewPrice = effectiveRsRatioNew > 0 ? effectiveRsCurrentPrice * (effectiveRsRatioOld / effectiveRsRatioNew) : 0;
  const rsNewLots = effectiveRsRatioOld > 0 ? effectiveRsLots * (effectiveRsRatioNew / effectiveRsRatioOld) : 0;
  const rsPortfolioValue = effectiveRsCurrentPrice * effectiveRsLots * 100;

  // ==========================================
  // 4. STATE & LOGIC: WARRANT (WARAN)
  // ==========================================
  const [wStockPrice, setWStockPrice] = useState<number | "">(5000);
  const [wExercisePrice, setWExercisePrice] = useState<number | "">(4200);
  const [wPurchasePrice, setWPurchasePrice] = useState<number | "">(150); // Warrant cost, default 150
  const [wLots, setWLots] = useState<number | "">(20);

  const effectiveWStockPrice = wStockPrice === "" ? 0 : wStockPrice;
  const effectiveWExercisePrice = wExercisePrice === "" ? 0 : wExercisePrice;
  const effectiveWPurchasePrice = wPurchasePrice === "" ? 0 : wPurchasePrice;
  const effectiveWLots = wLots === "" ? 0 : wLots;

  // Warrant calculations
  const wIntrinsicValue = Math.max(0, effectiveWStockPrice - effectiveWExercisePrice);
  const wBreakevenUnderlying = effectiveWExercisePrice + effectiveWPurchasePrice;
  const wNetProfitPerShare = effectiveWStockPrice - effectiveWExercisePrice - effectiveWPurchasePrice;
  const wNetProfitTotal = wNetProfitPerShare * effectiveWLots * 100;
  const wIsProfit = wNetProfitTotal >= 0;

  return (
    <div id="corporate-action-tab-container" className="space-y-12">
      {/* ======================= SECTION 1: RIGHT ISSUE (HMETD) ======================= */}
      <section id="right-issue-section" className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">1. Kalkulator Right Issue (HMETD)</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Hitung harga teoritis saham saat Ex-Date berdasarkan rasio emisi saham baru dan harga pelaksanaan tebus</p>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Inputs */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider border-b border-slate-200 pb-2">Data HMETD</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Harga Cum-Date (Rp)</label>
                <input
                  type="number"
                  value={riCumPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRiCumPrice(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                  }}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Harga Tebus (Rp)</label>
                <input
                  type="number"
                  value={riExercisePrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRiExercisePrice(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                  }}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
              <span className="block text-xs font-bold text-indigo-600 uppercase tracking-wider">Rasio Kepemilikan (Lama : Baru)</span>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Rasio Saham Lama (A)</label>
                  <input
                    type="number"
                    value={riOldRatio}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRiOldRatio(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                    }}
                    className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="Misal: 4"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Rasio Saham Baru (B)</label>
                  <input
                    type="number"
                    value={riNewRatio}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRiNewRatio(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                    }}
                    className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="Misal: 1"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 font-medium italic mt-1">Setiap kepemilikan {riOldRatio || 0} saham lama berhak menebus {riNewRatio || 0} saham baru.</p>
            </div>
          </div>

          {/* Outputs */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-6">
              <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider border-b border-slate-200 pb-2">Penyesuaian Harga Ex-Date</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Result 1 */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="block text-[11px] text-slate-500 font-bold uppercase tracking-wider">Harga Teoritis Ex-Date</span>
                  <span className="text-xl font-bold text-slate-800 font-mono block mt-1">
                    {formatRupiah(riTheoreticalPrice, true)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1 font-medium">Harga acuan pembukaan hari Ex-Date</span>
                </div>

                {/* Result 2 */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="block text-[11px] text-slate-500 font-bold uppercase tracking-wider">Adjustment Ratio</span>
                  <span className="text-xl font-bold text-rose-600 font-mono block mt-1">
                    {riAdjustmentPercent.toFixed(2)}%
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1 font-medium">Penurunan teknis dibanding Cum-Date</span>
                </div>
              </div>

              {/* Informative advice */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed font-medium">
                <span className="font-bold text-slate-700 block mb-1">Catatan Mekanisme Ex-Date:</span>
                Harga saham secara teori mengalami penurunan karena adanya penambahan lembar saham baru di pasar. Penurunan ini tidak mengurangi total nilai aset portofolio jika Anda menebus Right yang didapat.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= SECTION 2: STOCK SPLIT ======================= */}
      <section id="stock-split-section" className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <ArrowRightLeft className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">2. Kalkulator Stock Split</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Hitung harga penyesuaian baru dan kelipatan penambahan jumlah lot kepemilikan setelah pemecahan nilai nominal saham</p>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Inputs */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider border-b border-slate-200 pb-2">Konfigurasi Stock Split</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Harga Saham Sebelum Split (Rp)</label>
                <input
                  type="number"
                  value={ssCurrentPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSsCurrentPrice(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                  }}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Jumlah Lot Sebelum Split</label>
                <input
                  type="number"
                  value={ssLots}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSsLots(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                  }}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                <span className="block text-xs font-bold text-indigo-600 uppercase tracking-wider">Rasio Stock Split (Lama : Baru)</span>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Rasio Saham Lama (A)</label>
                    <input
                      type="number"
                      value={ssRatioOld}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSsRatioOld(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                      }}
                      className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="Misal: 1"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Rasio Saham Baru (B)</label>
                    <input
                      type="number"
                      value={ssRatioNew}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSsRatioNew(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                      }}
                      className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="Misal: 5"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 font-medium italic mt-1">Setiap {ssRatioOld || 0} saham lama akan dipecah menjadi {ssRatioNew || 0} saham baru.</p>
              </div>
            </div>
          </div>

          {/* Outputs */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-6">
              <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider border-b border-slate-200 pb-2">Hasil Pasca Stock Split</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Price */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="block text-xs text-slate-500 font-bold">Harga Saham Baru</span>
                  <span className="text-xl font-extrabold text-indigo-600 font-mono block mt-1">
                    {formatRupiah(ssNewPrice, true)}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block font-medium">Penyesuaian rasio {ssRatioOld || 0} : {ssRatioNew || 0}</span>
                </div>

                {/* Lots */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="block text-xs text-slate-500 font-bold">Jumlah Lot Baru</span>
                  <span className="text-xl font-extrabold text-emerald-600 font-mono block mt-1">
                    {formatNumber(ssNewLots)} Lot
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block font-medium">({formatNumber(ssNewLots * 100)} lembar)</span>
                </div>
              </div>

              {/* Integrity check value */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center text-xs font-medium">
                <span className="text-slate-500">Total Nilai Kepemilikan (Sama):</span>
                <span className="font-bold text-slate-800 font-mono">{formatRupiah(ssPortfolioValue)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= SECTION 3: REVERSE SPLIT ======================= */}
      <section id="reverse-split-section" className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Scale className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">3. Kalkulator Reverse Stock Split</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Hitung harga penyesuaian baru dan pengurangan jumlah unit lot akibat penggabungan beberapa lembar saham</p>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Inputs */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider border-b border-slate-200 pb-2">Konfigurasi Reverse Split</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Harga Saham Sebelum Reverse (Rp)</label>
                <input
                  type="number"
                  value={rsCurrentPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRsCurrentPrice(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                  }}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Jumlah Lot Sebelum Reverse</label>
                <input
                  type="number"
                  value={rsLots}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRsLots(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                  }}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                <span className="block text-xs font-bold text-indigo-600 uppercase tracking-wider">Rasio Reverse Stock Split (Lama : Baru)</span>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Rasio Saham Lama (A)</label>
                    <input
                      type="number"
                      value={rsRatioOld}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRsRatioOld(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                      }}
                      className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="Misal: 10"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Rasio Saham Baru (B)</label>
                    <input
                      type="number"
                      value={rsRatioNew}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRsRatioNew(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                      }}
                      className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="Misal: 1"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 font-medium italic mt-1">Setiap {rsRatioOld || 0} saham lama akan digabungkan menjadi {rsRatioNew || 0} saham baru.</p>
              </div>
            </div>
          </div>

          {/* Outputs */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-6">
              <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider border-b border-slate-200 pb-2">Hasil Pasca Reverse Split</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Price */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="block text-xs text-slate-500 font-bold">Harga Saham Baru</span>
                  <span className="text-xl font-extrabold text-indigo-600 font-mono block mt-1">
                    {formatRupiah(rsNewPrice, true)}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block font-medium">Penyesuaian rasio {rsRatioOld || 0} : {rsRatioNew || 0}</span>
                </div>

                {/* Lots */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="block text-xs text-slate-500 font-bold">Jumlah Lot Baru</span>
                  <span className={`text-xl font-extrabold font-mono block mt-1 ${rsNewLots % 1 !== 0 ? "text-amber-600" : "text-emerald-600"}`}>
                    {rsNewLots.toFixed(2)} Lot
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block font-medium">({formatNumber(rsNewLots * 100)} lembar)</span>
                </div>
              </div>

              {rsNewLots % 1 !== 0 && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-800 flex gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>Ada pecahan lot sisa ({ (rsNewLots % 1).toFixed(2) } Lot) yang biasanya akan dicairkan oleh sekuritas dalam bentuk dana tunai (Cash-in-Lieu).</span>
                </div>
              )}

              {/* Integrity check value */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center text-xs font-medium">
                <span className="text-slate-500">Total Nilai Kepemilikan (Sama):</span>
                <span className="font-bold text-slate-800 font-mono">{formatRupiah(rsPortfolioValue)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= SECTION 4: WARRANT (WARAN) ======================= */}
      <section id="warrant-section" className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <BadgeAlert className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">4. Kalkulator Warrant (Waran)</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Analisis nilai intrinsik waran, harga pulang pokok (breakeven), serta proyeksi keuntungan/kerugian bersih jika dieksekusi</p>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Inputs */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider border-b border-slate-200 pb-2">Data Waran</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Harga Saham Induk (Rp)</label>
                <input
                  type="number"
                  value={wStockPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setWStockPrice(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                  }}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Harga Tebus Waran (Rp)</label>
                <input
                  type="number"
                  value={wExercisePrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setWExercisePrice(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                  }}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Harga Beli Waran (Rp)</label>
                <input
                  type="number"
                  value={wPurchasePrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setWPurchasePrice(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                  }}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="0 jika gratis"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Jumlah Lot Waran</label>
                <input
                  type="number"
                  value={wLots}
                  onChange={(e) => {
                    const val = e.target.value;
                    setWLots(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                  }}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>
          </div>

          {/* Outputs */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-6">
              <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider border-b border-slate-200 pb-2">Analisis Kelayakan Waran</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Intrinsic Value */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="block text-xs text-slate-500 font-bold">Nilai Intrinsik Waran</span>
                  <span className="text-xl font-bold text-slate-800 font-mono block mt-1">
                    {formatRupiah(wIntrinsicValue, true)}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block font-medium">({wStockPrice || 0} - {wExercisePrice || 0})</span>
                </div>

                {/* Breakeven */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="block text-xs text-slate-500 font-bold">Underlying Breakeven</span>
                  <span className="text-xl font-bold text-indigo-600 font-mono block mt-1">
                    {formatRupiah(wBreakevenUnderlying)}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block font-medium">Harga impas tebus induk</span>
                </div>
              </div>

              {/* Net Profit Projection Dashboard */}
              <div className={`rounded-xl border p-5 flex items-center justify-between transition-all duration-300 ${
                wIsProfit 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}>
                <div>
                  <span className="block text-xs font-medium text-slate-600">Proyeksi Keuntungan Bersih</span>
                  <span className={`text-2xl font-extrabold font-mono ${wIsProfit ? "text-emerald-600" : "text-rose-600"}`}>
                    {wIsProfit ? "+" : ""}{formatRupiah(wNetProfitTotal)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium block mt-1 font-sans">Jika waran ditebus dan induk langsung dijual</span>
                </div>

                <div className="p-3 rounded-full bg-white border border-slate-100 shadow-sm">
                  {wIsProfit ? (
                    <TrendingUp className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-rose-500" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
