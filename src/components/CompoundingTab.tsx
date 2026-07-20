/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Calculator, Download, FileText, AlertCircle } from "lucide-react";
import { jsPDF } from "jspdf";
import { formatRupiah, formatNumber, formatPercent } from "../utils";

export default function CompoundingTab() {
  // =========================================================
  // STATE & LOGIC: COMPOUNDING SIMULATOR
  // =========================================================
  const [compInstrumentType, setCompInstrumentType] = useState<"saham" | "berbunga">("saham");
  const [compInitialModal, setCompInitialModal] = useState<number | "">(10000000);
  const [compMonthlyContribution, setCompMonthlyContribution] = useState<number | "">(1000000);
  const [compIncludeCapitalGain, setCompIncludeCapitalGain] = useState<boolean>(false);
  const [compCapitalGain, setCompCapitalGain] = useState<number | "">(7);
  const [compDividendYield, setCompDividendYield] = useState<number | "">(5);
  const [compInterestRate, setCompInterestRate] = useState<number | "">(6);
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
  const effInterestRate = compInterestRate === "" ? 0 : compInterestRate;
  const effCompYears = compDurationYears === "" ? 0 : compDurationYears;
  const effInflation = compInflation === "" ? 0 : compInflation;

  let currentVal = effCompInitial;
  let currentDep = effCompInitial;
  let accumulatedCashDividends = 0;
  const compMilestones: { year: number; value: number; deposit: number; interestEarned: number; dividendEarned: number; accumDiv: number; inflationAdjustedValue: number }[] = [];

  const effRateOfYield = compInstrumentType === "saham" ? effDivYield : effInterestRate;
  const effYieldToUse = compTaxDividends ? effRateOfYield * 0.9 : effRateOfYield;
  const effCapGainToUse = compInstrumentType === "saham" ? effCapitalGain : 0;

  for (let y = 1; y <= effCompYears; y++) {
    const rateToUse = compReinvestDividends ? (effCapGainToUse + effYieldToUse) : effCapGainToUse;
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

    // Dividen/Bunga dihitung di akhir tahun berdasarkan nilai portofolio akhir tahun tersebut dikali Yield % (bersih setelah pajak jika aktif)
    const annualDiv = currentVal * (effYieldToUse / 100);

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

  const labelYield = compInstrumentType === "saham" ? "Dividen" : "Bunga";
  const labelYieldCapitalized = compInstrumentType === "saham" ? "Dividen" : "Bunga";
  const labelReinvest = compInstrumentType === "saham" ? "Reinvestasi Dividen (DRIP)?" : "Reinvestasi Bunga (Gulung Pokok)?";
  const labelTotalCashYield = compInstrumentType === "saham" ? "Total Kas Dividen" : "Total Kas Bunga";
  const labelYieldEarnedYearly = compInstrumentType === "saham" ? "Dividen Tahun Ini" : "Bunga Tahun Ini";
  const labelPortofolioText = compInstrumentType === "saham" ? "Portofolio (Saham)" : "Portofolio (Pokok)";
  const labelTaxCheckbox = compInstrumentType === "saham" ? "Potong Pajak Dividen (10%)?" : "Potong Pajak Bunga (10%)?";

  const handleExportReport = () => {
    if (compMilestones.length === 0) return;

    // CSV Header (Tahun, Modal Disetor, Dividen/Bunga Didapat, Nilai Portofolio)
    const headers = [
      "Tahun",
      "Modal Disetor (IDR)",
      `${labelYieldEarnedYearly} (IDR)`,
      `Akumulasi Kas ${labelYieldCapitalized} (IDR)`,
      `${labelPortofolioText} (IDR)`,
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

  const handleExportPDF = () => {
    if (compMilestones.length === 0) return;

    const doc = new jsPDF("p", "mm", "a4");
    const today = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Color definitions (Indigo and Slate theme)
    const primaryColor = [79, 70, 229]; // Indigo #4f46e5
    const secondaryColor = [30, 41, 59]; // Slate #1e293b
    const textMuted = [100, 116, 139]; // Slate 500 #64748b
    const greenColor = [5, 150, 105]; // Emerald #059669

    let currentY = 15;

    // Helper: draw divider
    const drawDivider = (y: number) => {
      doc.setDrawColor(226, 232, 240); // border-slate-200
      doc.setLineWidth(0.5);
      doc.line(14, y, 196, y);
    };

    // Header Title
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Laporan Simulasi Compounding Portofolio", 14, currentY + 5);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`Dicetak pada: ${today}`, 14, currentY + 11);
    
    currentY += 15;
    drawDivider(currentY);
    currentY += 7;

    // Section 1: Parameter Input
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("RINGKASAN PARAMETER INPUT", 14, currentY);
    
    currentY += 5;
    
    // Create a 2-column key-value grid for inputs
    const inputsL = [
      ["Modal Awal", formatRupiah(effCompInitial)],
      ["Setoran Rutin", `${formatRupiah(effCompMonthly)} (${compFrequency === "monthly" ? "Bulanan" : "Tahunan"})`],
      ["Durasi Proyeksi", `${effCompYears} Tahun`],
    ];
    
    const inputsR = compInstrumentType === "saham" ? [
      ["Capital Gain Tahunan", compIncludeCapitalGain ? `${effCapitalGain}%` : "Tidak Disertakan"],
      ["Dividend Yield Tahunan", `${effDivYield}%`],
      ["Reinvestasi Dividen", compReinvestDividends ? "Ya (Digulung)" : "Tidak (Kas)"],
      ["Pajak Dividen (10%)", compTaxDividends ? "Ya (Dipotong)" : "Tidak"],
      ["Estimasi Inflasi Tahunan", effInflation > 0 ? `${effInflation}%` : "0% (Tidak Dihitung)"],
    ] : [
      ["Bunga / Kupon Tahunan", `${effInterestRate}%`],
      ["Reinvestasi Bunga", compReinvestDividends ? "Ya (Digulung)" : "Tidak (Kas)"],
      ["Pajak Bunga (10%)", compTaxDividends ? "Ya (Dipotong)" : "Tidak"],
      ["Estimasi Inflasi Tahunan", effInflation > 0 ? `${effInflation}%` : "0% (Tidak Dihitung)"],
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85); // Slate 700

    let inputLeftY = currentY;
    inputsL.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(label + ":", 14, inputLeftY + 4);
      doc.setFont("helvetica", "normal");
      doc.text(value, 50, inputLeftY + 4);
      inputLeftY += 6;
    });

    let inputRightY = currentY;
    inputsR.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(label + ":", 110, inputRightY + 4);
      doc.setFont("helvetica", "normal");
      doc.text(value, 160, inputRightY + 4);
      inputRightY += 6;
    });

    currentY = Math.max(inputLeftY, inputRightY) + 6;
    drawDivider(currentY);
    currentY += 7;

    // Section 2: Ringkasan Hasil (Summary Cards representation)
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("RANGKUMAN HASIL AKUMULASI", 14, currentY);
    
    currentY += 5;

    // Draw styled panels/summary blocks
    const summaryData = [
      ["Total Modal Setor", formatRupiah(finalDeposited), "Total dana yang Anda setorkan mandiri"],
      [labelPortofolioText, formatRupiah(finalValue), compInstrumentType === "saham" ? "Pertumbuhan nilai aset saham" : "Akumulasi nilai pokok investasi"],
      [labelTotalCashYield, formatRupiah(finalCashDividends), compReinvestDividends ? "Otomatis diinvestasikan kembali" : `Akumulasi ${labelYield.toLowerCase()} tunai dicairkan`],
      ["Kekayaan Akhir", formatRupiah(finalTotalWealth), `Nilai portofolio + kas ${labelYield.toLowerCase()}`],
      ["Total Keuntungan", `+${formatRupiah(finalGain)}`, `Pertumbuhan Netto sebesar +${formatPercent(finalDeposited > 0 ? (finalGain / finalDeposited) * 100 : 0)}`],
      ["Nilai Riil (Daya Beli)", formatRupiah(finalInflationAdjusted), `Disesuaikan dengan inflasi tahunan ${effInflation}%`],
    ];

    doc.setFontSize(9);
    let summaryY = currentY;
    summaryData.forEach(([label, val, desc], index) => {
      const col = index % 2; // 2 column layout for summary blocks
      const x = col === 0 ? 14 : 110;
      const cardY = summaryY + Math.floor(index / 2) * 16;
      
      // Draw background panel border & filling
      doc.setFillColor(248, 250, 252); // light slate background
      doc.roundedRect(x, cardY, 82, 13, 1, 1, "F");
      
      // Text
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139); // slate-500
      doc.setFontSize(7.5);
      doc.text(label.toUpperCase(), x + 3, cardY + 3.5);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      if (label.includes("Keuntungan")) {
        doc.setTextColor(greenColor[0], greenColor[1], greenColor[2]); // green for profit
      } else if (label.includes("Nilai Riil")) {
        doc.setTextColor(217, 119, 6); // Amber-600
      } else {
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      }
      doc.text(val, x + 3, cardY + 8);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184); // slate-400
      doc.setFontSize(6.5);
      doc.text(desc, x + 3, cardY + 11);
    });

    currentY += Math.ceil(summaryData.length / 2) * 16 + 4;
    drawDivider(currentY);
    currentY += 7;

    // Section 3: Milestone Tahunan Table
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("TABEL MILESTONE PERTUMBUHAN TAHUNAN", 14, currentY);
    
    currentY += 5;

    // Table Headers
    const tableHeaders = [
      "Thn",
      "Modal Setor",
      `${labelYieldCapitalized} Thn Ini`,
      `Akumulasi ${compInstrumentType === "saham" ? "Div" : "Bunga"}`,
      labelPortofolioText,
      "Total Kekayaan",
      "Nilai Riil"
    ];

    const adjustedWidths = [10, 27, 27, 26, 31, 31, 30];

    // Draw header row background
    doc.setFillColor(79, 70, 229); // indigo accent
    doc.rect(14, currentY, 182, 7, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);

    let startX = 14;
    tableHeaders.forEach((th, idx) => {
      const align = idx === 0 ? "left" : "right";
      const textX = align === "left" ? startX + 2 : startX + adjustedWidths[idx] - 2;
      doc.text(th, textX, currentY + 4.8, { align: align as "left" | "right" | "center" });
      startX += adjustedWidths[idx];
    });

    currentY += 7;

    // Table rows
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);

    compMilestones.forEach((ms, msIdx) => {
      // Check if we need to add a new page (approx 8mm per row)
      if (currentY + 7 > 280) {
        doc.addPage();
        currentY = 15;
        
        // Redraw table headers on new page
        doc.setFillColor(79, 70, 229);
        doc.rect(14, currentY, 182, 7, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);

        let sX = 14;
        tableHeaders.forEach((th, idx) => {
          const align = idx === 0 ? "left" : "right";
          const textX = align === "left" ? sX + 2 : sX + adjustedWidths[idx] - 2;
          doc.text(th, textX, currentY + 4.8, { align: align as "left" | "right" | "center" });
          sX += adjustedWidths[idx];
        });

        currentY += 7;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
      }

      // Alternate row backgrounds
      if (msIdx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, currentY, 182, 6, "F");
      }

      doc.setTextColor(51, 65, 85); // Slate 700
      let rowX = 14;

      const rowValues = [
        ms.year.toString(),
        formatRupiah(ms.deposit),
        formatRupiah(ms.dividendEarned),
        formatRupiah(ms.accumDiv),
        formatRupiah(ms.value),
        formatRupiah(ms.value + ms.accumDiv),
        formatRupiah(ms.inflationAdjustedValue)
      ];

      rowValues.forEach((val, idx) => {
        const align = idx === 0 ? "left" : "right";
        const textX = align === "left" ? rowX + 2 : rowX + adjustedWidths[idx] - 2;
        
        // Apply dynamic colors to special columns
        if (idx === 2) {
          doc.setTextColor(5, 150, 105); // emerald green for dividend/interest
        } else if (idx === 6) {
          doc.setTextColor(217, 119, 6); // amber for inflation value
        } else {
          doc.setTextColor(51, 65, 85);
        }

        doc.text(val, textX, currentY + 4.2, { align: align as "left" | "right" | "center" });
        rowX += adjustedWidths[idx];
      });

      // Bottom light border line for each row
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.3);
      doc.line(14, currentY + 6, 196, currentY + 6);

      currentY += 6;
    });

    // Save PDF
    doc.save(`laporan_compounding_${effCompYears}_tahun.pdf`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <section id="compounding-section" className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Calculator className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Kalkulator Simulasi Compounding (Bunga Berbunga)</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Simulasikan pertumbuhan dana investasi Anda secara eksponensial dengan opsi Reinvestasi Hasil (DRIP / Gulung Pokok)</p>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Inputs Panel */}
          <div className="lg:col-span-5 space-y-5">
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider border-b border-slate-200 pb-2">Parameter Investasi</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Pilih Tipe Instrumen:</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setCompInstrumentType("saham")}
                    className={`py-1.5 px-3 text-xs font-bold rounded-md transition-all uppercase tracking-wider cursor-pointer ${
                      compInstrumentType === "saham"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                    }`}
                  >
                    Saham
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompInstrumentType("berbunga")}
                    className={`py-1.5 px-3 text-xs font-bold rounded-md transition-all uppercase tracking-wider cursor-pointer ${
                      compInstrumentType === "berbunga"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                    }`}
                  >
                    Instrumen Berbunga
                  </button>
                </div>
              </div>

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

              {compInstrumentType === "saham" ? (
                <>
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
                </>
              ) : (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 leading-tight">Bunga / Kupon per Tahun (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={compInterestRate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCompInterestRate(val === "" ? "" : Math.max(0, parseFloat(val) || 0));
                      }}
                      className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg pl-3 pr-8 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">%</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Lama Investasi (Tahun)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={compDurationYears}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCompDurationYears(val === "" ? "" : Math.max(1, Math.min(50, parseInt(val) || 1)));
                      }}
                      className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-semibold"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">Thn</span>
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
                    {labelReinvest}
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
                    {labelTaxCheckbox}
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 p-3.5 rounded-xl flex items-start gap-2.5 text-[11px] text-indigo-800 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Kekuatan Compounding:</span> Semakin lama durasi investasi Anda, semakin besar porsi keuntungan (bunga majemuk / pertumbuhan hasil) dibandingkan dengan akumulasi modal dasar yang Anda setorkan.
              </div>
            </div>
          </div>

          {/* Outputs Panel */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-2">
                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Rangkuman Akumulasi Masa Depan</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleExportReport}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all duration-200 border border-indigo-100 uppercase tracking-wider cursor-pointer shadow-sm hover:shadow active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Laporan (CSV)</span>
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all duration-200 border border-rose-100 uppercase tracking-wider cursor-pointer shadow-sm hover:shadow active:scale-95"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Download Laporan (PDF)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                <div className="bg-gradient-to-br from-indigo-50/50 to-white p-3 rounded-xl border border-indigo-100 shadow-sm min-w-0">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold truncate">{labelPortofolioText}</span>
                  <span className="text-xs sm:text-sm font-extrabold text-indigo-700 font-mono block mt-1 break-all">
                    {formatRupiah(finalValue)}
                  </span>
                  <span className="block text-[9px] text-slate-400 mt-0.5 truncate">
                    {compInstrumentType === "saham" ? "Pertumbuhan nilai saham" : "Akumulasi nilai pokok"}
                  </span>
                </div>

                <div className="bg-gradient-to-br from-emerald-50/40 to-white p-3 rounded-xl border border-emerald-100 shadow-sm min-w-0">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold truncate">{labelTotalCashYield}</span>
                  {compReinvestDividends ? (
                    <div>
                      <span className="text-xs font-bold text-slate-400 block mt-1">Rp 0</span>
                      <span className="block text-[9px] text-emerald-600 font-semibold mt-0.5 leading-tight">
                        {compInstrumentType === "saham" ? "Digulung ke portofolio" : "Digulung ke pokok"}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xs sm:text-sm font-extrabold text-emerald-700 font-mono block mt-1 break-all">
                        {formatRupiah(finalCashDividends)}
                      </span>
                      <span className="block text-[9px] text-slate-400 mt-0.5 truncate">
                        {compInstrumentType === "saham" ? "Dividen tunai terpisah" : "Bunga tunai terpisah"}
                      </span>
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
                            <span className="text-slate-500 font-medium font-sans">{labelPortofolioText}:</span>
                            <span className="font-bold text-slate-800 font-mono">{formatRupiah(ms.value)}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-medium font-sans">{labelYieldEarnedYearly}:</span>
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
    </div>
  );
}
