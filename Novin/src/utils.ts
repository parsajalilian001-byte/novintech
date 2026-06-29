/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Helper to convert English numbers to Persian numbers
export function toPersianDigits(num: number | string | undefined): string {
  if (num === undefined || num === null) return '';
  const str = num.toString();
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, (w) => farsiDigits[parseInt(w, 10)]);
}

// Format number as Iranian Rial (e.g., ۱۲,۰۰۰,۰۰۰ ریال)
export function formatRial(amount: number): string {
  const formatted = amount.toLocaleString('en-US');
  return `${toPersianDigits(formatted)} ریال`;
}

// Convert a standard Date or solar hijri string to custom formatted labels
export function getStatusBadge(status: 'paid' | 'pending' | 'overdue'): {
  text: string;
  bgClass: string;
  textClass: string;
  dotClass: string;
} {
  switch (status) {
    case 'paid':
      return {
        text: 'پرداخت شده',
        bgClass: 'bg-emerald-500/10 border border-emerald-500/30',
        textClass: 'text-emerald-400',
        dotClass: 'bg-emerald-400',
      };
    case 'pending':
      return {
        text: 'در انتظار پرداخت',
        bgClass: 'bg-amber-500/10 border border-amber-500/30',
        textClass: 'text-amber-400',
        dotClass: 'bg-amber-400',
      };
    case 'overdue':
      return {
        text: 'معوقه (دیرکرد)',
        bgClass: 'bg-rose-500/10 border border-rose-500/30',
        textClass: 'text-rose-400',
        dotClass: 'bg-rose-400',
      };
  }
}

// CSV Export Utility for Farsi (UTF-8 with BOM)
export function exportToCSV(data: any[], fileName: string, headers: string[]) {
  // Create CSV Content
  let csvContent = '\uFEFF'; // Add UTF-8 BOM for Excel to open Farsi correctly
  
  // Add Headers
  csvContent += headers.join(',') + '\n';
  
  // Add Rows
  data.forEach((row) => {
    const values = Object.values(row).map(val => {
      // Escape commas and double quotes
      const strVal = val !== null && val !== undefined ? String(val) : '';
      if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
        return `"${strVal.replace(/"/g, '""')}"`;
      }
      return strVal;
    });
    csvContent += values.join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
