/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BrokerFeeCalculatorInputs {
  brokerName: string;
  buyPrice: number;
  sellPrice: number;
  lots: number;
  buyFeePercent: number;
  sellFeePercent: number;
}

export interface BrokerFeeCalculatorOutputs {
  totalBuyValue: number;
  buyFeeAmount: number;
  totalNetCapital: number;
  totalSellValue: number;
  sellFeeAmount: number;
  totalNetProceeds: number;
  profitCostNominal: number;
  profitCostPercent: number;
  isProfit: boolean;
}

export interface AverageDownRow {
  id: string;
  price: number | "";
  lots: number | "";
}

export interface AverageDownOutputs {
  totalShares: number;
  totalLots: number;
  totalCapital: number;
  averagePrice: number;
}

export interface RiskRewardInputs {
  buyPrice: number;
  takeProfitPrice: number;
  stopLossPrice: number;
}

export interface RiskRewardOutputs {
  riskPerShare: number;
  rewardPerShare: number;
  ratioMultiplier: number;
  feasibilityStatus: "SANGAT_LAYAK" | "CUKUP_LAYAK" | "TIDAK_LAYAK" | "INVALID";
}

export interface DCAMonthlyPriceRow {
  id: string;
  monthIndex: number;
  price: number | "";
}

export interface DCAInputs {
  monthlyBudget: number;
  monthsCount: number;
  dividendYield: number;
  prices: DCAMonthlyPriceRow[];
}

export interface DCAOutputs {
  totalInvested: number;
  totalLotsAcquired: number;
  totalSharesAcquired: number;
  averagePrice: number;
  annualDividendIncome: number;
  remainingCash: number;
}

export interface DividendInputs {
  lots: number;
  avgBuyPrice: number;
  yieldPercent: number;
  dividendPerShare: number;
  lastChanged: "yield" | "dps";
}

export interface PortfolioAllocationItem {
  id: string;
  assetName: string;
  percentage: number;
  assetType?: "Saham" | "Reksadana" | "Emas" | "Kas" | "Lainnya" | "Crypto" | "Valas" | "SBN/Obligasi" | "Deposito";
  // Saham specific
  sahamLots?: number | "";
  sahamAvgPrice?: number | "";
  sahamCurrentPrice?: number | "";
  // Reksadana specific
  buyNab?: number | "";
  currentNab?: number | "";
  totalUnits?: number | "";
  // Emas specific
  goldWeight?: number | "";
  goldBuyPrice?: number | "";
  goldCurrentPrice?: number | "";
  // Crypto specific
  cryptoCoins?: number | "";
  cryptoBuyPrice?: number | "";
  cryptoCurrentPrice?: number | "";
  // Valas specific
  currencyName?: string;
  valasAmount?: number | "";
  valasBuyRate?: number | "";
  valasCurrentRate?: number | "";
  // SBN specific
  sbnNominal?: number | "";
  sbnCouponPercent?: number | "";
  // Deposito specific
  depositoNominal?: number | "";
  depositoInterestPercent?: number | "";
  // Kas specific
  kasNominal?: number | "";
  // Lainnya specific
  lainnyaNominal?: number | "";
}

export interface MarginOfSafetyInputs {
  intrinsicValue: number;
  currentPrice: number;
}

export interface MarginOfSafetyOutputs {
  mosPercent: number;
  status: "SANGAT_AMAN" | "WAJAR" | "OVERVALUED";
  description: string;
}

export interface RightIssueInputs {
  cumDatePrice: number;
  exercisePrice: number;
  oldRatio: number;
  newRatio: number;
}

export interface StockSplitInputs {
  currentPrice: number;
  lots: number;
  splitN: number;
}

export interface ReverseSplitInputs {
  currentPrice: number;
  lots: number;
  reverseM: number;
}

export interface WarrantInputs {
  stockPrice: number;
  exercisePrice: number;
  warrantCost: number;
  lots: number;
}
