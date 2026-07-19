/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Formats a number as Indonesian Rupiah (IDR).
 * @param value Number to format.
 * @param includeDecimals Whether to include decimals for precise numbers.
 */
export function formatRupiah(value: number, includeDecimals = false): string {
  if (isNaN(value) || !isFinite(value)) return "Rp 0";
  
  // Indonesian locale (id-ID) formats currency as Rp 1.000.000
  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  });
  
  return formatter.format(value);
}

/**
 * Formats a number with Indonesian thousand separators.
 */
export function formatNumber(value: number, decimalDigits = 0): string {
  if (isNaN(value) || !isFinite(value)) return "0";
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: decimalDigits,
    maximumFractionDigits: decimalDigits,
  }).format(value);
}

/**
 * Formats a percentage.
 */
export function formatPercent(value: number, decimalDigits = 2): string {
  if (isNaN(value) || !isFinite(value)) return "0%";
  return `${formatNumber(value, decimalDigits)}%`;
}

/**
 * Generates a unique ID for dynamic list rows.
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
