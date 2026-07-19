/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Percent, AlertCircle, PieChart, Info, Plus, Trash2, Coins, Calendar, TrendingUp, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatRupiah, formatPercent, generateId } from "../utils";
import { PortfolioAllocationItem } from "../types";

interface DividendDistribution {
  dps: number | "";
  month: string;
}

interface DividendStockItem {
  id: string;
  stockCode: string;
  avgPrice: number | "";
  lots: number | "";
  currentPrice: number | "";
  frequencyType: 1 | 2 | 3 | 4; // 1 to 4 distributions
  distributions: DividendDistribution[];
}

export default function PortfolioTab() {
  // =========================================================
  // 1. STATE & LOGIC: ASSET ALLOCATION
  // =========================================================
  const [allocationItems, setAllocationItems] = useState<PortfolioAllocationItem[]>([
    { id: "1", assetName: "BBRI", percentage: 25, assetType: "Saham", sahamLots: 50, sahamAvgPrice: 4800, sahamCurrentPrice: 5100 },
    { id: "2", assetName: "Reksadana Saham", percentage: 20, assetType: "Reksadana", buyNab: 1000, currentNab: 1150, totalUnits: 20000 },
    { id: "3", assetName: "Emas Antam", percentage: 15, assetType: "Emas", goldWeight: 25, goldBuyPrice: 1000000, goldCurrentPrice: 1120000 },
    { id: "4", assetName: "Bitcoin", percentage: 15, assetType: "Crypto", cryptoCoins: 0.1, cryptoBuyPrice: 900000000, cryptoCurrentPrice: 1050000000 },
    { id: "5", assetName: "USD Cash", percentage: 15, assetType: "Valas", currencyName: "USD", valasAmount: 1000, valasBuyRate: 15000, valasCurrentRate: 16200 },
    { id: "6", assetName: "Kas / RDPU", percentage: 10, assetType: "Kas", kasNominal: 10000000 },
  ]);

  const updateAllocationName = (id: string, name: string) => {
    setAllocationItems(
      allocationItems.map((item) =>
        item.id === id ? { ...item, assetName: name } : item
      )
    );
  };

  const updateAllocationPercent = (id: string, pct: number) => {
    setAllocationItems(
      allocationItems.map((item) =>
        item.id === id
          ? { ...item, percentage: Math.max(0, Math.min(100, pct)) }
          : item
      )
    );
  };

  const updateAllocationType = (id: string, type: "Saham" | "Reksadana" | "Emas" | "Kas" | "Lainnya" | "Crypto" | "Valas" | "SBN/Obligasi" | "Deposito") => {
    setAllocationItems(
      allocationItems.map((item) => {
        if (item.id !== id) return item;
        const updated: PortfolioAllocationItem = {
          ...item,
          assetType: type,
        };
        if (type === "Saham") {
          updated.sahamLots = item.sahamLots !== undefined ? item.sahamLots : 10;
          updated.sahamAvgPrice = item.sahamAvgPrice !== undefined ? item.sahamAvgPrice : 5000;
          updated.sahamCurrentPrice = item.sahamCurrentPrice !== undefined ? item.sahamCurrentPrice : 5200;
        } else if (type === "Reksadana") {
          updated.buyNab = item.buyNab !== undefined ? item.buyNab : 1000;
          updated.currentNab = item.currentNab !== undefined ? item.currentNab : 1100;
          updated.totalUnits = item.totalUnits !== undefined ? item.totalUnits : 10000;
        } else if (type === "Emas") {
          updated.goldWeight = item.goldWeight !== undefined ? item.goldWeight : 10;
          updated.goldBuyPrice = item.goldBuyPrice !== undefined ? item.goldBuyPrice : 1000000;
          updated.goldCurrentPrice = item.goldCurrentPrice !== undefined ? item.goldCurrentPrice : 1100000;
        } else if (type === "Crypto") {
          updated.cryptoCoins = item.cryptoCoins !== undefined ? item.cryptoCoins : 0.5;
          updated.cryptoBuyPrice = item.cryptoBuyPrice !== undefined ? item.cryptoBuyPrice : 50000000;
          updated.cryptoCurrentPrice = item.cryptoCurrentPrice !== undefined ? item.cryptoCurrentPrice : 55000000;
        } else if (type === "Valas") {
          updated.currencyName = item.currencyName !== undefined ? item.currencyName : "USD";
          updated.valasAmount = item.valasAmount !== undefined ? item.valasAmount : 1000;
          updated.valasBuyRate = item.valasBuyRate !== undefined ? item.valasBuyRate : 15000;
          updated.valasCurrentRate = item.valasCurrentRate !== undefined ? item.valasCurrentRate : 15500;
        } else if (type === "SBN/Obligasi") {
          updated.sbnNominal = item.sbnNominal !== undefined ? item.sbnNominal : 10000000;
          updated.sbnCouponPercent = item.sbnCouponPercent !== undefined ? item.sbnCouponPercent : 6;
        } else if (type === "Deposito") {
          updated.depositoNominal = item.depositoNominal !== undefined ? item.depositoNominal : 25000000;
          updated.depositoInterestPercent = item.depositoInterestPercent !== undefined ? item.depositoInterestPercent : 4;
        } else if (type === "Kas") {
          updated.kasNominal = item.kasNominal !== undefined ? item.kasNominal : 10000000;
        } else if (type === "Lainnya") {
          updated.lainnyaNominal = item.lainnyaNominal !== undefined ? item.lainnyaNominal : 5000000;
        }
        return updated;
      })
    );
  };

  const updateAllocationField = (id: string, field: string, value: any) => {
    setAllocationItems(
      allocationItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addAllocationItem = () => {
    if (allocationItems.length >= 8) return; // limit to 8 assets for clean layout
    const currentTotal = allocationItems.reduce((acc, curr) => acc + curr.percentage, 0);
    const remaining = Math.max(0, 100 - currentTotal);
    setAllocationItems([
      ...allocationItems,
      { 
        id: generateId(), 
        assetName: `ASET${allocationItems.length + 1}`, 
        percentage: remaining > 0 ? remaining : 0,
        assetType: "Saham",
        sahamLots: 10,
        sahamAvgPrice: 5000,
        sahamCurrentPrice: 5200
      },
    ]);
  };

  const removeAllocationItem = (id: string) => {
    if (allocationItems.length <= 1) return; // keep at least 1
    setAllocationItems(allocationItems.filter((item) => item.id !== id));
  };

  const totalAllocationPercent = allocationItems.reduce(
    (acc, curr) => acc + curr.percentage,
    0
  );

  // =========================================================
  // 2. STATE & LOGIC: DIVIDEND STOCK PORTFOLIO
  // =========================================================
  const [dividendStocks, setDividendStocks] = useState<DividendStockItem[]>([
    {
      id: "1",
      stockCode: "BBRI",
      avgPrice: 4800,
      currentPrice: 5100,
      lots: 50,
      frequencyType: 2,
      distributions: [
        { dps: 84, month: "Des" },
        { dps: 235, month: "Mar" },
        { dps: "", month: "" },
        { dps: "", month: "" },
      ],
    },
    {
      id: "2",
      stockCode: "TLKM",
      avgPrice: 3500,
      currentPrice: 3200,
      lots: 30,
      frequencyType: 1,
      distributions: [
        { dps: 140, month: "Jun" },
        { dps: "", month: "" },
        { dps: "", month: "" },
        { dps: "", month: "" },
      ],
    },
    {
      id: "3",
      stockCode: "PTBA",
      avgPrice: 2600,
      currentPrice: 2800,
      lots: 40,
      frequencyType: 1,
      distributions: [
        { dps: 380, month: "Jun" },
        { dps: "", month: "" },
        { dps: "", month: "" },
        { dps: "", month: "" },
      ],
    },
  ]);

  const updateStock = (id: string, field: keyof DividendStockItem, value: any) => {
    setDividendStocks(
      dividendStocks.map((stock) =>
        stock.id === id ? { ...stock, [field]: value } : stock
      )
    );
  };

  const updateStockDistribution = (id: string, index: number, field: keyof DividendDistribution, value: any) => {
    setDividendStocks(
      dividendStocks.map((stock) => {
        if (stock.id !== id) return stock;
        const newDistributions = [...stock.distributions];
        newDistributions[index] = {
          ...newDistributions[index],
          [field]: value
        };
        return {
          ...stock,
          distributions: newDistributions
        };
      })
    );
  };

  const addStock = () => {
    if (dividendStocks.length >= 12) return; // safety cap
    setDividendStocks([
      ...dividendStocks,
      {
        id: generateId(),
        stockCode: "KODE",
        avgPrice: 1000,
        currentPrice: 1000,
        lots: 10,
        frequencyType: 1,
        distributions: [
          { dps: 50, month: "Mei" },
          { dps: "", month: "" },
          { dps: "", month: "" },
          { dps: "", month: "" },
        ],
      },
    ]);
  };

  const removeStock = (id: string) => {
    if (dividendStocks.length <= 1) return; // keep at least 1
    setDividendStocks(dividendStocks.filter((stock) => stock.id !== id));
  };

  // Helper calculation for total/effective DPS (only sum up to frequencyType)
  const getEffectiveDPSForStock = (stock: DividendStockItem) => {
    let sumDPS = 0;
    for (let i = 0; i < stock.frequencyType; i++) {
      if (stock.distributions[i]) {
        const dpsVal = stock.distributions[i].dps;
        sumDPS += dpsVal === "" ? 0 : dpsVal;
      }
    }
    return sumDPS;
  };

  // Helper calculation for a single stock item
  const getAnnualDividendForStock = (stock: DividendStockItem) => {
    const lotsVal = stock.lots === "" ? 0 : stock.lots;
    const totalShares = lotsVal * 100;
    return totalShares * getEffectiveDPSForStock(stock);
  };

  // Helper calculation for Capital Gain on a single stock item
  const getCapitalGainForStock = (stock: DividendStockItem) => {
    const avg = stock.avgPrice === "" ? 0 : stock.avgPrice;
    const current = stock.currentPrice === "" ? 0 : stock.currentPrice;
    const lots = stock.lots === "" ? 0 : stock.lots;
    const totalShares = lots * 100;
    
    const cost = totalShares * avg;
    const marketVal = totalShares * current;
    const rupiah = marketVal - cost;
    const percent = avg > 0 ? ((current - avg) / avg) * 100 : 0;
    return { percent, rupiah };
  };

  // Calculations for dividend stock portfolio
  const totalDivCapital = dividendStocks.reduce((sum, s) => {
    const lotsVal = s.lots === "" ? 0 : s.lots;
    const avgPriceVal = s.avgPrice === "" ? 0 : s.avgPrice;
    return sum + (lotsVal * 100 * avgPriceVal);
  }, 0);

  const totalMarketValue = dividendStocks.reduce((sum, s) => {
    const lotsVal = s.lots === "" ? 0 : s.lots;
    const currentPriceVal = s.currentPrice === "" ? 0 : s.currentPrice;
    return sum + (lotsVal * 100 * currentPriceVal);
  }, 0);

  const totalCapitalGainValue = totalMarketValue - totalDivCapital;
  const totalCapitalGainPercent = totalDivCapital > 0 ? (totalCapitalGainValue / totalDivCapital) * 100 : 0;

  const totalDivAnnual = dividendStocks.reduce((sum, s) => sum + getAnnualDividendForStock(s), 0);
  const avgDivYield = totalDivCapital > 0 ? (totalDivAnnual / totalDivCapital) * 100 : 0;
  const monthlyDivEquivalent = totalDivAnnual / 12;

  // Granular calculations for Reksadana, Emas, Crypto, Valas and other assets in allocation items
  let reksadanaTotalCost = 0;
  let reksadanaTotalValue = 0;
  let emasTotalCost = 0;
  let emasTotalValue = 0;
  let cryptoTotalCost = 0;
  let cryptoTotalValue = 0;
  let valasTotalCost = 0;
  let valasTotalValue = 0;
  let sbnTotalCost = 0;
  let sbnTotalValue = 0;
  let sbnAnnualCoupon = 0;
  let depositoTotalCost = 0;
  let depositoTotalValue = 0;
  let depositoAnnualInterest = 0;
  let kasTotalValue = 0;
  let lainnyaTotalValue = 0;
  let localSahamTotalCost = 0;
  let localSahamTotalValue = 0;

  allocationItems.forEach((item) => {
    if (item.assetType === "Saham") {
      const hasLocalSaham = item.sahamLots !== undefined;
      if (hasLocalSaham) {
        const lotsVal = item.sahamLots === "" || item.sahamLots === undefined ? 0 : item.sahamLots;
        const avgPriceVal = item.sahamAvgPrice === "" || item.sahamAvgPrice === undefined ? 0 : item.sahamAvgPrice;
        const currentPriceVal = item.sahamCurrentPrice === "" || item.sahamCurrentPrice === undefined ? 0 : item.sahamCurrentPrice;
        localSahamTotalCost += lotsVal * 100 * avgPriceVal;
        localSahamTotalValue += lotsVal * 100 * currentPriceVal;
      }
    } else if (item.assetType === "Reksadana") {
      const buyNab = item.buyNab === "" || item.buyNab === undefined ? 1000 : item.buyNab;
      const currentNab = item.currentNab === "" || item.currentNab === undefined ? 1100 : item.currentNab;
      const totalUnits = item.totalUnits === "" || item.totalUnits === undefined ? 1000 : item.totalUnits;
      reksadanaTotalCost += buyNab * totalUnits;
      reksadanaTotalValue += currentNab * totalUnits;
    } else if (item.assetType === "Emas") {
      const weight = item.goldWeight === "" || item.goldWeight === undefined ? 10 : item.goldWeight;
      const buyPrice = item.goldBuyPrice === "" || item.goldBuyPrice === undefined ? 1000000 : item.goldBuyPrice;
      const currentPrice = item.goldCurrentPrice === "" || item.goldCurrentPrice === undefined ? 1100000 : item.goldCurrentPrice;
      emasTotalCost += weight * buyPrice;
      emasTotalValue += weight * currentPrice;
    } else if (item.assetType === "Crypto") {
      const coins = item.cryptoCoins === "" || item.cryptoCoins === undefined ? 0.5 : item.cryptoCoins;
      const buyPrice = item.cryptoBuyPrice === "" || item.cryptoBuyPrice === undefined ? 50000000 : item.cryptoBuyPrice;
      const currentPrice = item.cryptoCurrentPrice === "" || item.cryptoCurrentPrice === undefined ? 55000000 : item.cryptoCurrentPrice;
      cryptoTotalCost += coins * buyPrice;
      cryptoTotalValue += coins * currentPrice;
    } else if (item.assetType === "Valas") {
      const amount = item.valasAmount === "" || item.valasAmount === undefined ? 1000 : item.valasAmount;
      const buyRate = item.valasBuyRate === "" || item.valasBuyRate === undefined ? 15000 : item.valasBuyRate;
      const currentRate = item.valasCurrentRate === "" || item.valasCurrentRate === undefined ? 15500 : item.valasCurrentRate;
      valasTotalCost += amount * buyRate;
      valasTotalValue += amount * currentRate;
    } else if (item.assetType === "SBN/Obligasi") {
      const nominal = item.sbnNominal === "" || item.sbnNominal === undefined ? 10000000 : item.sbnNominal;
      const coupon = item.sbnCouponPercent === "" || item.sbnCouponPercent === undefined ? 6 : item.sbnCouponPercent;
      sbnTotalCost += nominal;
      sbnTotalValue += nominal;
      sbnAnnualCoupon += (nominal * coupon) / 100;
    } else if (item.assetType === "Deposito") {
      const nominal = item.depositoNominal === "" || item.depositoNominal === undefined ? 25000000 : item.depositoNominal;
      const interest = item.depositoInterestPercent === "" || item.depositoInterestPercent === undefined ? 4 : item.depositoInterestPercent;
      depositoTotalCost += nominal;
      depositoTotalValue += nominal;
      depositoAnnualInterest += (nominal * interest) / 100;
    } else if (item.assetType === "Kas") {
      const nominal = item.kasNominal === "" || item.kasNominal === undefined ? 10000000 : item.kasNominal;
      kasTotalValue += nominal;
    } else if (item.assetType === "Lainnya") {
      const nominal = item.lainnyaNominal === "" || item.lainnyaNominal === undefined ? 5000000 : item.lainnyaNominal;
      lainnyaTotalValue += nominal;
    }
  });

  // Calculate Net Worth (Kekayaan Bersih) and overall performance
  const netWorth = totalMarketValue + reksadanaTotalValue + emasTotalValue + kasTotalValue + lainnyaTotalValue + cryptoTotalValue + valasTotalValue + sbnTotalValue + depositoTotalValue + localSahamTotalValue;
  const netWorthTotalCost = totalDivCapital + reksadanaTotalCost + emasTotalCost + kasTotalValue + lainnyaTotalValue + cryptoTotalCost + valasTotalCost + sbnTotalCost + depositoTotalCost + localSahamTotalCost;
  const netWorthGain = netWorth - netWorthTotalCost;
  const netWorthGainPercent = netWorthTotalCost > 0 ? (netWorthGain / netWorthTotalCost) * 100 : 0;

  // Fluctuating assets only for "Pertumbuhan Aset" (Capital Gain)
  const fluctuatingCost = (totalDivCapital + localSahamTotalCost) + reksadanaTotalCost + emasTotalCost + cryptoTotalCost + valasTotalCost;
  const fluctuatingValue = (totalMarketValue + localSahamTotalValue) + reksadanaTotalValue + emasTotalValue + cryptoTotalValue + valasTotalValue;
  const fluctuatingGain = fluctuatingValue - fluctuatingCost;
  const fluctuatingGainPercent = fluctuatingCost > 0 ? (fluctuatingGain / fluctuatingCost) * 100 : 0;

  const totalPassiveIncome = totalDivAnnual + sbnAnnualCoupon + depositoAnnualInterest;
  const monthlyPassiveIncome = totalPassiveIncome / 12;
  const passiveIncomeTotalCapital = (totalDivCapital + localSahamTotalCost) + sbnTotalCost + depositoTotalCost;

  const getAllocationItemMetrics = (item: PortfolioAllocationItem) => {
    let cost = 0;
    let value = 0;

    if (item.assetType === "Saham") {
      const lotsVal = item.sahamLots === "" || item.sahamLots === undefined ? 0 : item.sahamLots;
      const avgPriceVal = item.sahamAvgPrice === "" || item.sahamAvgPrice === undefined ? 0 : item.sahamAvgPrice;
      const currentPriceVal = item.sahamCurrentPrice === "" || item.sahamCurrentPrice === undefined ? 0 : item.sahamCurrentPrice;
      cost = lotsVal * 100 * avgPriceVal;
      value = lotsVal * 100 * currentPriceVal;

      if (cost === 0 && value === 0) {
        const stock = dividendStocks.find(s => s.stockCode.trim().toUpperCase() === item.assetName.trim().toUpperCase());
        if (stock) {
          const sLots = stock.lots === "" ? 0 : stock.lots;
          const sAvg = stock.avgPrice === "" ? 0 : stock.avgPrice;
          const sCurr = stock.currentPrice === "" ? 0 : stock.currentPrice;
          cost = sLots * 100 * sAvg;
          value = sLots * 100 * sCurr;
        }
      }
    } else if (item.assetType === "Reksadana") {
      const buyNab = item.buyNab === "" || item.buyNab === undefined ? 1000 : item.buyNab;
      const currentNab = item.currentNab === "" || item.currentNab === undefined ? 1100 : item.currentNab;
      const totalUnits = item.totalUnits === "" || item.totalUnits === undefined ? 1000 : item.totalUnits;
      cost = buyNab * totalUnits;
      value = currentNab * totalUnits;
    } else if (item.assetType === "Emas") {
      const weight = item.goldWeight === "" || item.goldWeight === undefined ? 10 : item.goldWeight;
      const buyPrice = item.goldBuyPrice === "" || item.goldBuyPrice === undefined ? 1000000 : item.goldBuyPrice;
      const currentPrice = item.goldCurrentPrice === "" || item.goldCurrentPrice === undefined ? 1100000 : item.goldCurrentPrice;
      cost = weight * buyPrice;
      value = weight * currentPrice;
    } else if (item.assetType === "Crypto") {
      const coins = item.cryptoCoins === "" || item.cryptoCoins === undefined ? 0.5 : item.cryptoCoins;
      const buyPrice = item.cryptoBuyPrice === "" || item.cryptoBuyPrice === undefined ? 50000000 : item.cryptoBuyPrice;
      const currentPrice = item.cryptoCurrentPrice === "" || item.cryptoCurrentPrice === undefined ? 55000000 : item.cryptoCurrentPrice;
      cost = coins * buyPrice;
      value = coins * currentPrice;
    } else if (item.assetType === "Valas") {
      const amount = item.valasAmount === "" || item.valasAmount === undefined ? 1000 : item.valasAmount;
      const buyRate = item.valasBuyRate === "" || item.valasBuyRate === undefined ? 15000 : item.valasBuyRate;
      const currentRate = item.valasCurrentRate === "" || item.valasCurrentRate === undefined ? 15500 : item.valasCurrentRate;
      cost = amount * buyRate;
      value = amount * currentRate;
    } else if (item.assetType === "SBN/Obligasi") {
      const nominal = item.sbnNominal === "" || item.sbnNominal === undefined ? 10000000 : item.sbnNominal;
      cost = nominal;
      value = nominal;
    } else if (item.assetType === "Deposito") {
      const nominal = item.depositoNominal === "" || item.depositoNominal === undefined ? 25000000 : item.depositoNominal;
      cost = nominal;
      value = nominal;
    } else if (item.assetType === "Kas") {
      const nominal = item.kasNominal === "" || item.kasNominal === undefined ? 10000000 : item.kasNominal;
      cost = nominal;
      value = nominal;
    } else if (item.assetType === "Lainnya") {
      const nominal = item.lainnyaNominal === "" || item.lainnyaNominal === undefined ? 5000000 : item.lainnyaNominal;
      cost = nominal;
      value = nominal;
    }

    return { cost, value };
  };

  return (
    <div id="portfolio-tab-container" className="space-y-12">
      {/* Intro Alert for Portfolio Allocation */}
      <div id="portfolio-intro" className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-start gap-3.5 shadow-sm">
        <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 leading-relaxed">
          <span className="font-bold text-slate-800">Kalkulator Alokasi & Portofolio:</span> Tentukan diversifikasi dana Anda pada bagian pertama, lalu catat serta simulasikan saham-saham dividend-investing Anda pada bagian kedua untuk memantau akumulasi dividen pasif tahunan dan rata-rata Yield on Cost secara real-time.
        </div>
      </div>

      {/* ======================= SECTION 1: ASSET ALLOCATION ======================= */}
      <section id="allocation-section" className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Percent className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">1. Alokasi Portofolio (Diversifikasi Dana)</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Bagi modal investasi Anda ke berbagai aset/saham secara aman dan terukur</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Allocation Inputs */}
          <div className="lg:col-span-6 space-y-5">
             <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Atur Persentase Alokasi</h3>
              <button
                type="button"
                onClick={addAllocationItem}
                disabled={allocationItems.length >= 8}
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Aset
              </button>
            </div>

            <div className="space-y-3">
              {allocationItems.map((item, idx) => (
                <div key={item.id} className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200/80 space-y-3 shadow-sm hover:border-slate-300 transition-colors">
                  {/* Row 1: Core controls */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
                    <span className="text-xs font-bold text-slate-400 w-4 shrink-0">#{idx + 1}</span>
                    
                    {/* Dropdown for Asset Type */}
                    <select
                      value={item.assetType || "Saham"}
                      onChange={(e) => updateAllocationType(item.id, e.target.value as any)}
                      className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 shrink-0"
                    >
                      <option value="Saham">Saham</option>
                      <option value="Reksadana">Reksadana</option>
                      <option value="Emas">Emas</option>
                      <option value="Crypto">Crypto</option>
                      <option value="Valas">Valas</option>
                      <option value="SBN/Obligasi">SBN/Obligasi</option>
                      <option value="Deposito">Deposito</option>
                      <option value="Kas">Kas (Cash)</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>

                    {/* Asset Name Input */}
                    <input
                      type="text"
                      value={item.assetName}
                      onChange={(e) => updateAllocationName(item.id, e.target.value)}
                      className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-lg px-2.5 py-1.5 flex-1 min-w-[80px] focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      placeholder={`Aset ${idx + 1}`}
                    />

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => removeAllocationItem(item.id)}
                      disabled={allocationItems.length <= 1}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-200/50 disabled:opacity-30 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Row 2 (Conditional inputs based on assetType) */}
                  {item.assetType === "Saham" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-white p-2.5 rounded-lg border border-slate-200/60 text-[10px]">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Jumlah Lot</label>
                        <input
                          type="number"
                          value={item.sahamLots ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateAllocationField(item.id, "sahamLots", val === "" ? "" : Math.max(0, parseInt(val) || 0));
                          }}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-mono rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="10"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Harga Rata-Rata Beli (Rp)</label>
                        <input
                          type="number"
                          value={item.sahamAvgPrice ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateAllocationField(item.id, "sahamAvgPrice", val === "" ? "" : Math.max(0, parseInt(val) || 0));
                          }}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-mono rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="5000"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Harga Sekarang (Rp)</label>
                        <input
                          type="number"
                          value={item.sahamCurrentPrice ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateAllocationField(item.id, "sahamCurrentPrice", val === "" ? "" : Math.max(0, parseInt(val) || 0));
                          }}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-mono rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="5200"
                        />
                      </div>
                    </div>
                  )}

                  {item.assetType === "Reksadana" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-white p-2.5 rounded-lg border border-slate-200/60 text-[10px]">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">NAB Beli / Unit (Rp)</label>
                        <input
                          type="number"
                          value={item.buyNab ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateAllocationField(item.id, "buyNab", val === "" ? "" : Math.max(0, parseFloat(val) || 0));
                          }}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-mono rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="1000"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1 font-sans">Nilai NAB/Unit (Rp)</label>
                        <input
                          type="number"
                          value={item.currentNab ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateAllocationField(item.id, "currentNab", val === "" ? "" : Math.max(0, parseFloat(val) || 0));
                          }}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-mono rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="1100"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Total Unit</label>
                        <input
                          type="number"
                          value={item.totalUnits ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateAllocationField(item.id, "totalUnits", val === "" ? "" : Math.max(0, parseFloat(val) || 0));
                          }}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-mono rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="15000"
                        />
                      </div>
                    </div>
                  )}

                  {item.assetType === "Emas" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-white p-2.5 rounded-lg border border-slate-200/60 text-[10px]">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Berat (gram)</label>
                        <input
                          type="number"
                          value={item.goldWeight ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateAllocationField(item.id, "goldWeight", val === "" ? "" : Math.max(0, parseFloat(val) || 0));
                          }}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-mono rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="10"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Harga Beli / Gram (Rp)</label>
                        <input
                          type="number"
                          value={item.goldBuyPrice ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateAllocationField(item.id, "goldBuyPrice", val === "" ? "" : Math.max(0, parseInt(val) || 0));
                          }}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-mono rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="1000000"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Harga Sekarang / Gram (Rp)</label>
                        <input
                          type="number"
                          value={item.goldCurrentPrice ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateAllocationField(item.id, "goldCurrentPrice", val === "" ? "" : Math.max(0, parseInt(val) || 0));
                          }}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-mono rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="1100000"
                        />
                      </div>
                    </div>
                  )}

                  {item.assetType === "Crypto" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-white p-2.5 rounded-lg border border-slate-200/60 text-[10px]">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Jumlah Koin/Token</label>
                        <input
                          type="number"
                          step="any"
                          value={item.cryptoCoins ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateAllocationField(item.id, "cryptoCoins", val === "" ? "" : Math.max(0, parseFloat(val) || 0));
                          }}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-mono rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="0.5"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Harga Beli / Koin (Rp)</label>
                        <input
                          type="number"
                          value={item.cryptoBuyPrice ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateAllocationField(item.id, "cryptoBuyPrice", val === "" ? "" : Math.max(0, parseInt(val) || 0));
                          }}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-mono rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="100000000"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Harga Sekarang / Koin (Rp)</label>
                        <input
                          type="number"
                          value={item.cryptoCurrentPrice ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateAllocationField(item.id, "cryptoCurrentPrice", val === "" ? "" : Math.max(0, parseInt(val) || 0));
                          }}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-mono rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="110000000"
                        />
                      </div>
                    </div>
                  )}

                  {item.assetType === "Valas" && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-white p-2.5 rounded-lg border border-slate-200/60 text-[10px]">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Nama Valas</label>
                        <input
                          type="text"
                          value={item.currencyName ?? ""}
                          onChange={(e) => {
                            updateAllocationField(item.id, "currencyName", e.target.value);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-sans rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="USD"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Jumlah Valas</label>
                        <input
                          type="number"
                          value={item.valasAmount ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateAllocationField(item.id, "valasAmount", val === "" ? "" : Math.max(0, parseFloat(val) || 0));
                          }}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-mono rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="1000"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Kurs Beli (Rp)</label>
                        <input
                          type="number"
                          value={item.valasBuyRate ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateAllocationField(item.id, "valasBuyRate", val === "" ? "" : Math.max(0, parseInt(val) || 0));
                          }}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-mono rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="15000"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1 font-sans font-medium">Kurs Sekarang (Rp)</label>
                        <input
                          type="number"
                          value={item.valasCurrentRate ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateAllocationField(item.id, "valasCurrentRate", val === "" ? "" : Math.max(0, parseInt(val) || 0));
                          }}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-mono rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="15500"
                        />
                      </div>
                    </div>
                  )}

                  {item.assetType === "SBN/Obligasi" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 bg-white p-2.5 rounded-lg border border-slate-200/60 text-[10px]">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Nominal Investasi (Rp)</label>
                        <input
                          type="number"
                          value={item.sbnNominal ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateAllocationField(item.id, "sbnNominal", val === "" ? "" : Math.max(0, parseInt(val) || 0));
                          }}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-mono rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="10000000"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Kupon per Tahun (%)</label>
                        <input
                          type="number"
                          step="any"
                          value={item.sbnCouponPercent ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateAllocationField(item.id, "sbnCouponPercent", val === "" ? "" : Math.max(0, parseFloat(val) || 0));
                          }}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-mono rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="6"
                        />
                      </div>
                    </div>
                  )}

                  {item.assetType === "Deposito" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 bg-white p-2.5 rounded-lg border border-slate-200/60 text-[10px]">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Nominal Investasi (Rp)</label>
                        <input
                          type="number"
                          value={item.depositoNominal ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateAllocationField(item.id, "depositoNominal", val === "" ? "" : Math.max(0, parseInt(val) || 0));
                          }}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-mono rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="25000000"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Bunga per Tahun (%)</label>
                        <input
                          type="number"
                          step="any"
                          value={item.depositoInterestPercent ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateAllocationField(item.id, "depositoInterestPercent", val === "" ? "" : Math.max(0, parseFloat(val) || 0));
                          }}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-mono rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="4"
                        />
                      </div>
                    </div>
                  )}

                  {item.assetType === "Kas" && (
                    <div className="grid grid-cols-1 bg-white p-2.5 rounded-lg border border-slate-200/60 text-[10px]">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Nominal Kas (Rp)</label>
                        <input
                          type="number"
                          value={item.kasNominal ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateAllocationField(item.id, "kasNominal", val === "" ? "" : Math.max(0, parseInt(val) || 0));
                          }}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-mono rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="10000000"
                        />
                      </div>
                    </div>
                  )}

                  {item.assetType === "Lainnya" && (
                    <div className="grid grid-cols-1 bg-white p-2.5 rounded-lg border border-slate-200/60 text-[10px]">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Nominal Aset Lainnya (Rp)</label>
                        <input
                          type="number"
                          value={item.lainnyaNominal ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateAllocationField(item.id, "lainnyaNominal", val === "" ? "" : Math.max(0, parseInt(val) || 0));
                          }}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-mono rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="5000000"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Total Indicator */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-slate-200 mt-4">
              <span className="text-xs text-slate-500 font-bold uppercase">Total Nilai Aset Terdaftar:</span>
              <span className="text-xs sm:text-sm font-extrabold font-mono px-2.5 py-0.5 rounded border text-emerald-700 bg-emerald-50 border-emerald-200">
                {formatRupiah(netWorth)}
              </span>
            </div>
          </div>

          {/* Allocation Outputs / Chart Representation */}
          <div className="lg:col-span-6 flex flex-col justify-start space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-5 min-w-0 break-words">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <PieChart className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Visualisasi Pembagian Dana</h3>
              </div>
              
              <div className="space-y-4">
                {allocationItems.map((item, index) => {
                  const metrics = getAllocationItemMetrics(item);
                  const allocatedCash = metrics.value;
                  const pct = netWorth > 0 ? (allocatedCash / netWorth) * 100 : 0;
                  // Assign unique color classes based on index
                  const colors = [
                    "bg-indigo-500",
                    "bg-emerald-500",
                    "bg-amber-500",
                    "bg-sky-500",
                    "bg-pink-500",
                    "bg-violet-500",
                    "bg-teal-500",
                    "bg-orange-500",
                  ];
                  const barColor = colors[index % colors.length];

                  return (
                    <div key={item.id} className="space-y-1.5 min-w-0">
                      <div className="flex justify-between items-baseline text-xs gap-2 min-w-0">
                        <span className="font-bold text-slate-700 truncate">{item.assetName || `Aset ${index + 1}`}</span>
                        <div className="space-x-1.5 font-mono font-semibold shrink-0">
                          <span className="text-slate-400">({pct.toFixed(1)}%)</span>
                          <span className="text-emerald-600">{formatRupiah(allocatedCash)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden border border-slate-300/40">
                        <div className={`h-full ${barColor} transition-all duration-300`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ringkasan & Performa Seluruh Aset (Net Worth) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-5 min-w-0 break-words shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <Wallet className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Ringkasan & Performa Seluruh Aset</h3>
              </div>

              {/* Net Worth Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Kekayaan Bersih</span>
                  <span className="text-sm font-extrabold text-slate-800 font-mono block truncate">
                    {formatRupiah(netWorth)}
                  </span>
                  <span className="text-[8px] text-slate-400 block font-semibold mt-0.5">Nilai pasar saat ini</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Total Modal</span>
                  <span className="text-sm font-extrabold text-slate-800 font-mono block truncate">
                    {formatRupiah(netWorthTotalCost)}
                  </span>
                  <span className="text-[8px] text-slate-400 block font-semibold mt-0.5">Akumulasi harga beli</span>
                </div>

                <div className="flex flex-col gap-3">
                  {(() => {
                    const isProfit = fluctuatingGain >= 0;
                    const colorClass = isProfit ? "text-emerald-600 bg-emerald-50/50 border-emerald-100" : "text-rose-600 bg-rose-50/50 border-rose-100";
                    return (
                      <div className={`p-3 rounded-xl border shadow-sm flex flex-col justify-between ${colorClass}`}>
                        <span className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Pertumbuhan Aset</span>
                        <span className="text-sm font-extrabold font-mono block truncate">
                          {isProfit ? "+" : ""}{formatRupiah(fluctuatingGain)}
                        </span>
                        <span className="text-[9px] font-bold font-mono block mt-0.5">
                          {isProfit ? "+" : ""}{formatPercent(fluctuatingGainPercent)}
                        </span>
                      </div>
                    );
                  })()}

                  <div className="bg-indigo-50/40 border border-indigo-100 p-3 rounded-xl shadow-sm flex flex-col justify-between text-indigo-900">
                    <span className="text-[9px] text-indigo-500 font-bold uppercase block mb-1">POTENSI PASSIVE INCOME GABUNGAN (SAHAM, SBN, DEPOSITO)</span>
                    <span className="text-sm font-extrabold font-mono block truncate text-indigo-700">
                      {formatRupiah(totalPassiveIncome)}<span className="text-[9px] font-normal text-indigo-400 lowercase block sm:inline sm:ml-1">/ tahun</span>
                    </span>
                    <div className="text-[9px] text-indigo-500/80 font-medium mt-1">
                      Estimasi: <span className="font-bold font-mono text-indigo-600">{formatRupiah(monthlyPassiveIncome)}</span> <span className="text-[8px] font-normal lowercase">/ bulan</span>
                    </div>
                    <div className="text-[10px] sm:text-xs text-slate-500 mt-2 pt-1.5 border-t border-indigo-100/50">
                      Total Modal Diinvestasikan: <span className="font-semibold text-slate-600 font-mono">{formatRupiah(passiveIncomeTotalCapital)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Granular asset breakdown performance */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rincian Performa per Kelas Aset</h4>

                <div className="space-y-2">
                  {/* Category: Saham */}
                  {(totalDivCapital > 0 || localSahamTotalCost > 0) && (
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 flex items-center justify-between gap-2 shadow-xs">
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">Saham</span>
                        <span className="text-[9px] text-slate-400 block">Modal: {formatRupiah(totalDivCapital + localSahamTotalCost)}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-extrabold text-slate-800 font-mono block">{formatRupiah(totalMarketValue + localSahamTotalValue)}</span>
                        <span className={`text-[9px] font-bold font-mono ${(totalMarketValue + localSahamTotalValue) >= (totalDivCapital + localSahamTotalCost) ? "text-emerald-600" : "text-rose-600"}`}>
                          {(totalMarketValue + localSahamTotalValue) >= (totalDivCapital + localSahamTotalCost) ? "+" : ""}{formatPercent(((totalMarketValue + localSahamTotalValue - (totalDivCapital + localSahamTotalCost)) / (totalDivCapital + localSahamTotalCost || 1)) * 100)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Category: Reksadana */}
                  {reksadanaTotalCost > 0 && (
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 flex items-center justify-between gap-2 shadow-xs">
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">Reksadana</span>
                        <span className="text-[9px] text-slate-400 block">Modal: {formatRupiah(reksadanaTotalCost)}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-extrabold text-slate-800 font-mono block">{formatRupiah(reksadanaTotalValue)}</span>
                        <span className={`text-[9px] font-bold font-mono ${reksadanaTotalValue >= reksadanaTotalCost ? "text-emerald-600" : "text-rose-600"}`}>
                          {reksadanaTotalValue >= reksadanaTotalCost ? "+" : ""}{formatPercent(((reksadanaTotalValue - reksadanaTotalCost) / reksadanaTotalCost) * 100)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Category: Emas */}
                  {emasTotalCost > 0 && (
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 flex items-center justify-between gap-2 shadow-xs">
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">Emas Fisik</span>
                        <span className="text-[9px] text-slate-400 block">Modal: {formatRupiah(emasTotalCost)}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-extrabold text-slate-800 font-mono block">{formatRupiah(emasTotalValue)}</span>
                        <span className={`text-[9px] font-bold font-mono ${emasTotalValue >= emasTotalCost ? "text-emerald-600" : "text-rose-600"}`}>
                          {emasTotalValue >= emasTotalCost ? "+" : ""}{formatPercent(((emasTotalValue - emasTotalCost) / emasTotalCost) * 100)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Category: Crypto */}
                  {cryptoTotalCost > 0 && (
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 flex items-center justify-between gap-2 shadow-xs">
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">Cryptocurrency</span>
                        <span className="text-[9px] text-slate-400 block">Modal: {formatRupiah(cryptoTotalCost)}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-extrabold text-slate-800 font-mono block">{formatRupiah(cryptoTotalValue)}</span>
                        <span className={`text-[9px] font-bold font-mono ${cryptoTotalValue >= cryptoTotalCost ? "text-emerald-600" : "text-rose-600"}`}>
                          {cryptoTotalValue >= cryptoTotalCost ? "+" : ""}{formatPercent(((cryptoTotalValue - cryptoTotalCost) / cryptoTotalCost) * 100)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Category: Valas */}
                  {valasTotalCost > 0 && (
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 flex items-center justify-between gap-2 shadow-xs">
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">Valuta Asing (Valas)</span>
                        <span className="text-[9px] text-slate-400 block">Modal: {formatRupiah(valasTotalCost)}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-extrabold text-slate-800 font-mono block">{formatRupiah(valasTotalValue)}</span>
                        <span className={`text-[9px] font-bold font-mono ${valasTotalValue >= valasTotalCost ? "text-emerald-600" : "text-rose-600"}`}>
                          {valasTotalValue >= valasTotalCost ? "+" : ""}{formatPercent(((valasTotalValue - valasTotalCost) / valasTotalCost) * 100)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Category: SBN / Obligasi */}
                  {sbnTotalCost > 0 && (
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 flex items-center justify-between gap-2 shadow-xs">
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">SBN / Obligasi</span>
                        <span className="text-[9px] text-slate-400 block">Modal: {formatRupiah(sbnTotalCost)}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-extrabold text-slate-800 font-mono block">{formatRupiah(sbnTotalValue)}</span>
                        <span className="text-[9px] text-emerald-600 font-bold font-mono block">
                          Kupon: {formatRupiah(sbnAnnualCoupon)}/thn
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Category: Deposito */}
                  {depositoTotalCost > 0 && (
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 flex items-center justify-between gap-2 shadow-xs">
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">Deposito</span>
                        <span className="text-[9px] text-slate-400 block">Modal: {formatRupiah(depositoTotalCost)}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-extrabold text-slate-800 font-mono block">{formatRupiah(depositoTotalValue)}</span>
                        <span className="text-[9px] text-emerald-600 font-bold font-mono block">
                          Bunga: {formatRupiah(depositoAnnualInterest)}/thn
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Category: Kas & Lainnya */}
                  {(kasTotalValue > 0 || lainnyaTotalValue > 0) && (
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 flex items-center justify-between gap-2 shadow-xs">
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">Kas & Lainnya</span>
                        <span className="text-[9px] text-slate-400 block">Alokasi Kas/Likuid</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-extrabold text-slate-800 font-mono block">{formatRupiah(kasTotalValue + lainnyaTotalValue)}</span>
                        <span className="text-[9px] text-slate-400 font-bold block">Stabil (0%)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= SECTION 2: DIVIDEND STOCK PORTFOLIO ======================= */}
      <section id="dividend-portfolio-section" className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Coins className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">2. Portofolio Saham Dividen (Passive Income Tracker)</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Monitor potensi penerimaan dividen pasif Anda berdasarkan rata-rata harga modal saham</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Interactive Table & Inputs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Daftar Kepemilikan Saham Dividen</h3>
              <button
                type="button"
                onClick={addStock}
                disabled={dividendStocks.length >= 12}
                className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 px-2 py-1 rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Saham
              </button>
            </div>

            {/* Responsive List: Mobile Card layout below md, structured table on md+ */}
            <div className="block md:hidden space-y-4">
              {dividendStocks.map((stock, idx) => {
                const totalShares = stock.lots * 100;
                const annualDividend = getAnnualDividendForStock(stock);
                const effectiveDPS = getEffectiveDPSForStock(stock);
                const yieldOnCost = stock.avgPrice > 0 ? (effectiveDPS / stock.avgPrice) * 100 : 0;

                return (
                  <div key={stock.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3.5 shadow-sm relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-2 py-0.5 font-mono">
                        #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeStock(stock.id)}
                        disabled={dividendStocks.length <= 1}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-200/50 disabled:opacity-30"
                        title="Hapus Saham"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kode Saham</label>
                        <input
                          type="text"
                          value={stock.stockCode}
                          onChange={(e) => updateStock(stock.id, "stockCode", e.target.value.toUpperCase())}
                          className="w-full bg-white border border-slate-200 text-slate-800 font-bold px-2 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                          placeholder="BBRI"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Jumlah Lot</label>
                        <input
                          type="number"
                          value={stock.lots}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateStock(stock.id, "lots", val === "" ? "" : Math.max(0, parseInt(val) || 0));
                          }}
                          className="w-full bg-white border border-slate-200 text-slate-800 font-mono px-2 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                          placeholder="50"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Rata-Rata Beli (Rp)</label>
                        <input
                          type="number"
                          value={stock.avgPrice}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateStock(stock.id, "avgPrice", val === "" ? "" : Math.max(0, parseInt(val) || 0));
                          }}
                          className="w-full bg-white border border-slate-200 text-slate-800 font-mono px-2 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                          placeholder="4800"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Harga Sekarang (Rp)</label>
                        <input
                          type="number"
                          value={stock.currentPrice}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateStock(stock.id, "currentPrice", val === "" ? "" : Math.max(0, parseInt(val) || 0));
                          }}
                          className="w-full bg-white border border-slate-200 text-slate-800 font-mono px-2 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                          placeholder="5100"
                        />
                      </div>

                      <div className="col-span-2 bg-slate-100/60 rounded-lg p-2.5 border border-slate-200/50 flex items-center justify-between select-none">
                        <div>
                          <span className="block text-[9px] font-bold text-slate-400 uppercase">Total Modal</span>
                          <span className="text-[8px] text-slate-400 font-medium">({stock.lots || 0} Lot × 100 × {formatRupiah(stock.avgPrice || 0)})</span>
                        </div>
                        <span className="text-xs font-extrabold text-slate-700 font-mono">
                          {formatRupiah((stock.lots || 0) * 100 * (stock.avgPrice || 0))}
                        </span>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Frekuensi Pembagian</label>
                        <select
                          value={stock.frequencyType}
                          onChange={(e) => updateStock(stock.id, "frequencyType", parseInt(e.target.value) as 1 | 2 | 3 | 4)}
                          className="w-full bg-white border border-slate-200 text-slate-800 px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-xs font-semibold"
                        >
                          <option value={1}>1x setahun</option>
                          <option value={2}>2x setahun</option>
                          <option value={3}>3x setahun</option>
                          <option value={4}>4x setahun (Kuartalan)</option>
                        </select>
                      </div>

                      <div className="col-span-2 overflow-hidden">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`mobile-freq-${stock.frequencyType}`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-2 bg-slate-100/50 p-2.5 rounded-xl border border-slate-200/50"
                          >
                            <span className="text-[9px] font-extrabold text-indigo-700 block uppercase tracking-wider select-none">
                              Rincian Dividen ({stock.frequencyType}x)
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {Array.from({ length: stock.frequencyType }).map((_, i) => (
                                <div key={i} className="grid grid-cols-2 gap-1.5 p-2 bg-white border border-slate-200/70 rounded-lg shadow-sm">
                                  <div>
                                    <label className="block text-[8px] font-bold text-slate-400 uppercase mb-0.5">DPS #{i + 1}</label>
                                    <input
                                      type="number"
                                      value={stock.distributions[i]?.dps}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        updateStockDistribution(stock.id, i, "dps", val === "" ? "" : Math.max(0, parseInt(val) || 0));
                                      }}
                                      className="w-full bg-slate-50/50 hover:bg-white border border-slate-200 text-slate-800 font-mono px-1.5 py-1 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                      placeholder="Rp"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[8px] font-bold text-slate-400 uppercase mb-0.5">Bulan #{i + 1}</label>
                                    <input
                                      type="text"
                                      value={stock.distributions[i]?.month || ""}
                                      onChange={(e) => updateStockDistribution(stock.id, i, "month", e.target.value)}
                                      className="w-full bg-slate-50/50 hover:bg-white border border-slate-200 text-slate-800 px-1.5 py-1 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                      placeholder="Bulan"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Auto calculated row-outputs on mobile */}
                    <div className="bg-white p-3 rounded-lg border border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-medium text-center">
                      <div className="flex flex-col items-center justify-center p-2 bg-slate-50/50 rounded-lg border border-slate-100 sm:border-0 sm:bg-transparent">
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Yield on Cost</span>
                        <span className="font-mono font-bold text-amber-600 text-xs sm:text-sm break-all whitespace-normal">{formatPercent(yieldOnCost)}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-2 bg-slate-50/50 rounded-lg border border-slate-100 sm:border-0 sm:bg-transparent">
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Capital Gain</span>
                        {(() => {
                          const { percent, rupiah } = getCapitalGainForStock(stock);
                          const isProfit = rupiah > 0;
                          const isLoss = rupiah < 0;
                          const colorClass = isProfit ? "text-emerald-600" : isLoss ? "text-rose-600" : "text-slate-500";
                          const prefix = isProfit ? "+" : "";
                          return (
                            <div className="text-center">
                              <span className={`font-mono font-bold block ${colorClass} text-xs sm:text-sm break-all whitespace-normal`}>
                                {prefix}{formatPercent(percent)}
                              </span>
                              <span className="block text-[9px] font-normal font-sans text-slate-400 mt-0.5 break-words whitespace-normal">
                                {prefix}{formatRupiah(rupiah)}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                      <div className="flex flex-col items-center justify-center p-2 bg-slate-50/50 rounded-lg border border-slate-100 sm:border-0 sm:bg-transparent">
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Dividen Tahunan</span>
                        <span className="font-mono font-bold text-emerald-600 block text-xs sm:text-sm break-all whitespace-normal">{formatRupiah(annualDividend)}</span>
                        <span className="text-[10px] text-slate-500 font-medium font-sans block mt-0.5 break-words whitespace-normal">{formatRupiah(Math.round(annualDividend / 12))} / bulan</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table: Beautiful, roomy table representation */}
            <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-xl bg-white">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 select-none">
                    <th className="py-3 px-3 w-10 text-center">No</th>
                    <th className="py-3 px-3 w-24">Kode Saham</th>
                    <th className="py-3 px-3 w-28">Harga Beli (Rp)</th>
                    <th className="py-3 px-3 w-28">Harga Sekarang (Rp)</th>
                    <th className="py-3 px-3 w-28 text-center">Capital Gain</th>
                    <th className="py-3 px-3 w-20">Jumlah Lot</th>
                    <th className="py-3 px-3 w-28">Frekuensi</th>
                    <th className="py-3 px-3 w-[200px]">Detail Dividen</th>
                    <th className="py-3 px-3 text-right w-24">Yield on Cost</th>
                    <th className="py-3 px-3 text-right w-28">Dividen Tahunan</th>
                    <th className="py-3 px-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {dividendStocks.map((stock, idx) => {
                    const totalShares = stock.lots * 100;
                    const annualDividend = getAnnualDividendForStock(stock);
                    const effectiveDPS = getEffectiveDPSForStock(stock);
                    const yieldOnCost = stock.avgPrice > 0 ? (effectiveDPS / stock.avgPrice) * 100 : 0;

                    return (
                      <tr key={stock.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-3 text-center font-mono text-slate-400 font-bold">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={stock.stockCode}
                            onChange={(e) => updateStock(stock.id, "stockCode", e.target.value.toUpperCase())}
                            className="w-full max-w-[80px] bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200/80 rounded px-2 py-1 font-bold text-slate-800 text-center uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-mono"
                          />
                        </td>
                        <td className="py-3 px-3 font-mono">
                          <input
                            type="number"
                            value={stock.avgPrice}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateStock(stock.id, "avgPrice", val === "" ? "" : Math.max(0, parseInt(val) || 0));
                            }}
                            className="w-full max-w-[90px] bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200/80 rounded px-2 py-1 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                          />
                          <span className="block text-[9px] text-slate-400 mt-1 font-sans font-medium whitespace-nowrap select-none">
                            Modal: {formatRupiah((stock.lots || 0) * 100 * (stock.avgPrice || 0))}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono">
                          <input
                            type="number"
                            value={stock.currentPrice}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateStock(stock.id, "currentPrice", val === "" ? "" : Math.max(0, parseInt(val) || 0));
                            }}
                            className="w-full max-w-[90px] bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200/80 rounded px-2 py-1 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                          />
                        </td>
                        <td className="py-3 px-3 text-center">
                          {(() => {
                            const { percent, rupiah } = getCapitalGainForStock(stock);
                            const isProfit = rupiah > 0;
                            const isLoss = rupiah < 0;
                            const colorClass = isProfit ? "text-emerald-600 font-bold" : isLoss ? "text-rose-600 font-bold" : "text-slate-500 font-semibold";
                            const prefix = isProfit ? "+" : "";
                            return (
                              <div className="flex flex-col items-center leading-tight">
                                <span className={`font-mono text-xs ${colorClass}`}>
                                  {prefix}{formatPercent(percent)}
                                </span>
                                <span className={`font-mono text-[10px] mt-0.5 ${isProfit ? "text-emerald-500 font-medium" : isLoss ? "text-rose-400 font-medium" : "text-slate-400"}`}>
                                  {prefix}{formatRupiah(rupiah)}
                                </span>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="py-3 px-3 font-mono">
                          <input
                            type="number"
                            value={stock.lots}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateStock(stock.id, "lots", val === "" ? "" : Math.max(0, parseInt(val) || 0));
                            }}
                            className="w-full max-w-[70px] bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200/80 rounded px-2 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={stock.frequencyType}
                            onChange={(e) => updateStock(stock.id, "frequencyType", parseInt(e.target.value) as 1 | 2 | 3 | 4)}
                            className="w-full bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200/80 rounded px-2 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-xs font-semibold"
                          >
                            <option value={1}>1x setahun</option>
                            <option value={2}>2x setahun</option>
                            <option value={3}>3x setahun</option>
                            <option value={4}>4x setahun (Kuartalan)</option>
                          </select>
                        </td>
                        <td className="py-3 px-3">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={`desk-freq-${stock.frequencyType}`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="grid grid-cols-1 gap-1.5"
                            >
                              {Array.from({ length: stock.frequencyType }).map((_, i) => (
                                <div key={i} className="flex gap-1.5 items-center bg-slate-50/50 hover:bg-slate-100/50 border border-slate-200/50 rounded p-1">
                                  <span className="text-[9px] font-bold text-slate-400 select-none w-5 text-center">#{i + 1}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="relative">
                                      <input
                                        type="number"
                                        value={stock.distributions[i]?.dps}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          updateStockDistribution(stock.id, i, "dps", val === "" ? "" : Math.max(0, parseInt(val) || 0));
                                        }}
                                        className="w-full bg-white border border-slate-200 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-[11px] font-mono pl-1.5 pr-6 py-0.5 rounded"
                                        placeholder="DPS"
                                      />
                                      <span className="absolute right-1 top-1 text-[7px] text-slate-400 font-bold uppercase select-none leading-relaxed">Rp</span>
                                    </div>
                                  </div>
                                  <div className="w-20">
                                    <input
                                      type="text"
                                      value={stock.distributions[i]?.month || ""}
                                      onChange={(e) => updateStockDistribution(stock.id, i, "month", e.target.value)}
                                      className="w-full bg-white border border-slate-200 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-[11px] px-1.5 py-0.5 rounded"
                                      placeholder="Bulan"
                                    />
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          </AnimatePresence>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-amber-600">
                          {formatPercent(yieldOnCost)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          <span className="font-bold text-emerald-600 block">
                            {formatRupiah(annualDividend)}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium font-sans block mt-0.5 whitespace-nowrap">
                            {formatRupiah(Math.round(annualDividend / 12))} / bulan
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeStock(stock.id)}
                            disabled={dividendStocks.length <= 1}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-100 disabled:opacity-30 transition-all"
                            title="Hapus Saham"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

             {/* Total passive income banner info */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg shrink-0">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="text-left">
                  <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">Potensi Passive Income Gabungan (Saham, SBN, Deposito)</span>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Jumlah keseluruhan pendapatan pasif tahunan dari dividen saham, kupon SBN/Obligasi, dan bunga Deposito Anda.
                  </p>
                </div>
              </div>
              <div className="text-right w-full sm:w-auto">
                <span className="text-xl sm:text-2xl font-black text-emerald-600 font-mono block">
                  {formatRupiah(totalPassiveIncome)}
                </span>
                <span className="text-[10px] text-slate-400 block font-semibold">
                  (~ {formatRupiah(Math.round(monthlyPassiveIncome))} / bulan secara merata)
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
