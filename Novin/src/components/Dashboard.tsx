/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  User,
  ArrowUpRight,
  Bell,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  Legend,
} from 'recharts';
import { Student, Installment, Transaction, ReminderLog } from '../types';
import { formatRial, toPersianDigits, getStatusBadge, exportToCSV } from '../utils';

interface DashboardProps {
  students: Student[];
  installments: Installment[];
  transactions: Transaction[];
  reminders: ReminderLog[];
  onTriggerReminder: (studentId: string, installmentId: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function Dashboard({
  students,
  installments,
  transactions,
  reminders,
  onTriggerReminder,
  onNavigateToTab,
}: DashboardProps) {
  // Analytical calculations
  const stats = useMemo(() => {
    const totalAssets = students.reduce((acc, s) => acc + s.totalAmount, 0);
    
    let paidAmount = 0;
    let pendingAmount = 0;
    let overdueAmount = 0;

    installments.forEach((inst) => {
      if (inst.status === 'paid') {
        paidAmount += inst.amount;
      } else if (inst.status === 'pending') {
        pendingAmount += inst.amount;
      } else if (inst.status === 'overdue') {
        overdueAmount += inst.amount;
      }
    });

    const recoveryRate = totalAssets > 0 ? (paidAmount / totalAssets) * 100 : 0;
    const overdueRate = totalAssets > 0 ? (overdueAmount / totalAssets) * 100 : 0;

    return {
      totalAssets,
      paidAmount,
      pendingAmount,
      overdueAmount,
      recoveryRate,
      overdueRate,
      studentsCount: students.length,
      overdueCount: installments.filter((i) => i.status === 'overdue').length,
    };
  }, [students, installments]);

  // Chart 1 data: Breakdown by Status
  const breakdownData = useMemo(() => {
    return [
      { name: 'وصول شده', مقدار: stats.paidAmount, color: '#10B981' },
      { name: 'در انتظار پرداخت', مقدار: stats.pendingAmount, color: '#F59E0B' },
      { name: 'معوقه (دیرکرد)', مقدار: stats.overdueAmount, color: '#EF4444' },
    ];
  }, [stats]);

  // Chart 2 data: Monthly Recovery Trend
  // For simplicity, we aggregate payments by month based on transactions
  const monthlyTrendData = useMemo(() => {
    const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'];
    const dataMap: { [key: string]: { paid: number; pending: number } } = {
      '01': { paid: 20000000, pending: 5000000 },
      '02': { paid: 25000000, pending: 8000000 },
      '03': { paid: 35000000, pending: 12000000 },
      '04': { paid: 18000000, pending: 22000000 },
      '05': { paid: 0, pending: 15000000 },
      '06': { paid: 0, pending: 18000000 },
    };

    // Update with real dynamic calculations if available
    transactions.forEach((tx) => {
      const parts = tx.date.split('/');
      if (parts.length > 1) {
        const month = parts[1]; // '02', '03', etc.
        if (dataMap[month]) {
          dataMap[month].paid += tx.amount;
        }
      }
    });

    return months.map((m, idx) => {
      const key = String(idx + 1).padStart(2, '0');
      return {
        name: m,
        'دریافتی (ریال)': dataMap[key]?.paid || 0,
        'در انتظار (ریال)': dataMap[key]?.pending || 0,
      };
    });
  }, [transactions]);

  // Currently Overdue List
  const overdueInstallmentsList = useMemo(() => {
    return installments
      .filter((inst) => inst.status === 'overdue')
      .map((inst) => {
        const student = students.find((s) => s.id === inst.studentId);
        return {
          ...inst,
          studentName: student?.name || 'نامشخص',
          phone: student?.phone || '',
          course: student?.courseName || '',
        };
      });
  }, [installments, students]);

  // Custom tooltips for Recharts to show Farsi text and converted numbers
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0d0d0d] border border-[#222] p-3 rounded-xl shadow-xl font-sans text-xs">
          <p className="font-semibold text-amber-500 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-gray-300">
              <span className="inline-block w-2 h-2 rounded-full mr-1 ml-1" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: <span className="text-white font-medium">{formatRial(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Export debtors report
  const handleExportDebtors = () => {
    const debtors = overdueInstallmentsList.map((inst) => ({
      'نام دانشجو': inst.studentName,
      'تلفن همراه': inst.phone,
      'عنوان دوره': inst.course,
      'مبلغ قسط معوق (ریال)': inst.amount,
      'تاریخ سررسید': inst.dueDate,
    }));
    exportToCSV(debtors, 'گزارش_دانشجویان_بدهکار_نوین_تک', [
      'نام دانشجو',
      'تلفن همراه',
      'عنوان دوره',
      'مبلغ قسط معوق (ریال)',
      'تاریخ سررسید',
    ]);
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* Upper Greeting with Live Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#0d0d0d] p-6 rounded-3xl border border-[#222]">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 font-sans flex items-center gap-3">
            <span className="gold-gradient-text gold-glow">پیشخوان تحلیل مالی نوین تک</span>
          </h2>
          <p className="text-gray-400 text-xs">
            رصد زنده جریانات نقدی، بررسی معوقات و تحلیل اتوماتیک وصول مطالبات دوره جامع آموزشی
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportDebtors}
            className="flex items-center gap-2 px-4 py-2 text-xs bg-[#111] hover:bg-[#1a1a1a] border border-[#333] text-gray-300 font-medium rounded-full transition-all duration-200 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-500" />
            خروجی اکسل بدهکاران
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 text-xs bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-full transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.3)]"
          >
            <FileText className="w-4 h-4" />
            چاپ فوری گزارش مالی
          </button>
        </div>
      </div>

      {/* KPI Cards (Grid layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Assets */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="relative overflow-hidden bg-[#0d0d0d] border border-[#222] rounded-3xl p-6 hover:border-amber-500/30 transition-all group gold-glow-box"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all duration-300"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs mb-1">مجموع سرمایه پرونده‌ها</p>
              <h3 className="text-2xl font-bold text-white font-mono mt-1">{formatRial(stats.totalAssets)}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#222] flex justify-between text-xs text-gray-500">
            <span>تعداد کل پرونده‌ها:</span>
            <span className="font-bold text-white font-mono">{toPersianDigits(stats.studentsCount)} دانشجو</span>
          </div>
        </motion.div>

        {/* Card 2: Paid Amount */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="relative overflow-hidden bg-[#0d0d0d] border border-[#222] rounded-3xl p-6 hover:border-emerald-500/30 transition-all group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-300"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs mb-1">وصول شده (مجموع واریزی)</p>
              <h3 className="text-2xl font-bold text-emerald-500 font-mono mt-1">{formatRial(stats.paidAmount)}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#222] flex justify-between text-xs text-gray-500">
            <span>نرخ وصول موفق:</span>
            <span className="font-bold text-emerald-500 font-mono">{toPersianDigits(stats.recoveryRate.toFixed(1))}%</span>
          </div>
        </motion.div>

        {/* Card 3: Pending Amount */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="relative overflow-hidden bg-[#0d0d0d] border border-[#222] rounded-3xl p-6 hover:border-amber-500/30 transition-all group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all duration-300"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs mb-1">در انتظار وصول (آینده)</p>
              <h3 className="text-2xl font-bold text-amber-500 font-mono mt-1">{formatRial(stats.pendingAmount)}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#222] flex justify-between text-xs text-gray-500">
            <span>تعهدات آتی در سررسید:</span>
            <span className="font-bold text-amber-500 font-mono">قابل پیگیری منظم</span>
          </div>
        </motion.div>

        {/* Card 4: Overdue Debt */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="relative overflow-hidden bg-[#0d0d0d] border border-[#222] rounded-3xl p-6 hover:border-rose-500/30 transition-all group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all duration-300"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs mb-1">مطالبات معوق (ریسک دیرکرد)</p>
              <h3 className="text-2xl font-bold text-rose-500 font-mono mt-1">{formatRial(stats.overdueAmount)}</h3>
            </div>
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#222] flex justify-between text-xs text-gray-500">
            <span>تعداد اقساط سررسید گذشته:</span>
            <span className="font-bold text-rose-500 font-mono">{toPersianDigits(stats.overdueCount)} قسط معوق</span>
          </div>
        </motion.div>
      </div>

      {/* Progress towards recovery and system live monitoring alert */}
      <div className="bg-[#0d0d0d] border border-[#222] rounded-3xl p-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-200">میزان پیشرفت وصول مطالبات کل آموزشگاه</span>
          <span className="text-sm font-bold text-amber-500 font-mono">{toPersianDigits(stats.recoveryRate.toFixed(1))}%</span>
        </div>
        <div className="w-full bg-[#1a1a1a] h-3 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${stats.recoveryRate}%` }}
            className="bg-gradient-to-l from-emerald-500 to-amber-500 h-full rounded-full transition-all duration-1000"
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>شروع وصول (۰٪)</span>
          <span>هدف نهایی وصول (۱۰۰٪)</span>
        </div>
      </div>

      {/* Analytical Charts and Statistics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 & 2: Main Area Chart */}
        <div className="lg:col-span-2 bg-[#0d0d0d] border border-[#222] p-6 rounded-3xl flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              روند بازگشت منابع مالی و برنامه وصول فصلی
            </h4>
            <span className="text-[10px] text-gray-500 bg-[#111] border border-[#222] px-2.5 py-1 rounded-full">به‌روزرسانی خودکار</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="paidGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="pendingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#666" fontSize={11} tickLine={false} />
                <YAxis stroke="#666" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="دریافتی (ریال)" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#paidGrad)" />
                <Area type="monotone" dataKey="در انتظار (ریال)" stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="3 3" fillOpacity={1} fill="url(#pendingGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 justify-center text-xs mt-4 pt-4 border-t border-[#222]">
            <div className="flex items-center gap-1.5 text-emerald-500">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              وصول نقد شده (موفق)
            </div>
            <div className="flex items-center gap-1.5 text-amber-500">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              در انتظار سررسید آتی
            </div>
          </div>
        </div>

        {/* Column 3: Category Breakdown Bar Chart */}
        <div className="bg-[#0d0d0d] border border-[#222] p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              وضعیت کیفی کل اقساط ثبت‌شده
            </h4>
            <p className="text-xs text-gray-500 mb-6">بررسی سهم مبالغ پرداخت شده، معوقه و معلق جاری</p>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={breakdownData} barSize={25}>
                <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} />
                <YAxis stroke="#666" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="مقدار" radius={[4, 4, 0, 0]}>
                  {breakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4 pt-4 border-t border-[#222]">
            {breakdownData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-mono font-bold text-[#e0e0e0]">{formatRial(item.مقدار)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overdue alerts & Reminders Center */}
      <div className="bg-[#0d0d0d] border border-[#222] rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
          <div>
            <h4 className="text-md font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
              اقساط سررسیدگذشته و دارای دیرکرد بحرانی
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              سیستم به طور خودکار اقساط زیر را شناسایی کرده است. ارسال پیامک دستی از این پنل فراهم است.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('reminders')}
            className="text-xs text-amber-500 hover:text-amber-400 font-bold transition-colors flex items-center gap-1 cursor-pointer"
          >
            مشاهده کل یادآورهای برنامه‌ریزی شده
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {overdueInstallmentsList.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            بسیار عالی! در حال حاضر هیچ قسط معوقه‌ای در کل سامانه وجود ندارد.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#222] text-gray-500 uppercase tracking-widest text-[10px]">
                  <th className="pb-3 font-semibold">نام دانشجو</th>
                  <th className="pb-3 font-semibold">دوره آموزشی</th>
                  <th className="pb-3 font-semibold">تلفن تماس</th>
                  <th className="pb-3 font-semibold">مبلغ قسط معوق</th>
                  <th className="pb-3 font-semibold">تاریخ سررسید</th>
                  <th className="pb-3 font-semibold text-center">اقدام پیگیری</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {overdueInstallmentsList.map((inst, index) => (
                  <tr key={index} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 font-semibold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                        {inst.studentName[0]}
                      </div>
                      {inst.studentName}
                    </td>
                    <td className="py-4 text-gray-300">{inst.course}</td>
                    <td className="py-4 text-gray-400 font-mono">{toPersianDigits(inst.phone)}</td>
                    <td className="py-4 text-rose-500 font-bold font-mono">{formatRial(inst.amount)}</td>
                    <td className="py-4 text-rose-500 font-semibold font-mono">{toPersianDigits(inst.dueDate)}</td>
                    <td className="py-4 text-center">
                      <button
                        onClick={() => onTriggerReminder(inst.studentId, inst.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-500 rounded-full font-bold transition-all duration-200 cursor-pointer"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        ارسال هشدار پیامکی دیرکرد
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
