/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Search,
  Filter,
  UserCheck,
  Send,
  Mail,
  CheckCircle2,
  AlertCircle,
  Database,
  Terminal,
  Activity,
  X,
} from 'lucide-react';
import { SystemLog, Student, Installment, UserRole } from '../types';
import { toPersianDigits, formatRial } from '../utils';

interface AuditLogsProps {
  logs: SystemLog[];
  students: Student[];
  installments: Installment[];
  currentUserRole: UserRole;
}

export default function AuditLogs({
  logs,
  students,
  installments,
  currentUserRole,
}: AuditLogsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isSendingReport, setIsSendingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchesSearch =
        l.userName.includes(searchTerm) ||
        l.action.includes(searchTerm) ||
        l.details.includes(searchTerm);

      const matchesRole = roleFilter === 'all' || l.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [logs, searchTerm, roleFilter]);

  // Calculations for executive report summary
  const reportSummary = useMemo(() => {
    const totalAssets = students.reduce((acc, s) => acc + s.totalAmount, 0);
    const paidSum = installments
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + i.amount, 0);
    const overdueSum = installments
      .filter((i) => i.status === 'overdue')
      .reduce((sum, i) => sum + i.amount, 0);
    const pendingSum = installments
      .filter((i) => i.status === 'pending')
      .reduce((sum, i) => sum + i.amount, 0);

    return {
      totalAssets,
      paidSum,
      overdueSum,
      pendingSum,
      activeDossiers: students.length,
      overdueCount: installments.filter((i) => i.status === 'overdue').length,
    };
  }, [students, installments]);

  const handleSendExecutiveReport = () => {
    setIsSendingReport(true);
    setReportSuccess(false);
    
    // Simulate SMTP dispatch
    setTimeout(() => {
      setIsSendingReport(false);
      setReportSuccess(true);
      setTimeout(() => {
        setReportSuccess(false);
      }, 5000);
    }, 1500);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Welcome Panel */}
      <div className="bg-[#0d0d0d] p-6 rounded-3xl border border-[#222] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-500" />
            سامانه لاگ‌گیری دقیق فعالیت‌ها و پیگیری عملکرد کاربران
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            لاگ‌های غیرقابل تغییر سیستم جهت شفافیت کامل، ثبت جزئیات کارمندان و دسترسی به پنل فرستنده گزارشات عالی مدیریتی
          </p>
        </div>
        <button
          onClick={handleSendExecutiveReport}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-full cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all duration-200"
        >
          <Mail className="w-4 h-4" />
          ارسال گزارش مدیریتی به مدیران ارشد
        </button>
      </div>

      {/* Grid: Reporting Preview & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Executive Report Dispatch Widget */}
        <div className="bg-[#0d0d0d] border border-[#222] p-6 rounded-3xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-amber-500 flex items-center gap-2 border-b border-[#222] pb-3">
              <Activity className="w-4 h-4" />
              پیش‌نمایش گزارش تحلیل وضعیت فصلی
            </h4>

            {/* Metrics */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-gray-400">
                <span>تعداد کل پرونده‌های مالی فعال:</span>
                <span className="font-bold text-white font-mono">{toPersianDigits(reportSummary.activeDossiers)} پرونده</span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>مجموع وصولی نقد شده (موفق):</span>
                <span className="font-bold text-emerald-500 font-mono">{formatRial(reportSummary.paidSum)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>مجموع تعهدات آتی (در انتظار):</span>
                <span className="font-bold text-amber-500 font-mono">{formatRial(reportSummary.pendingSum)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>کل مطالبات سررسید گذشته (معوقه):</span>
                <span className="font-bold text-rose-500 font-mono">{formatRial(reportSummary.overdueSum)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>اقساط معوقه پیگیری نشده:</span>
                <span className="font-bold text-rose-500 font-mono">{toPersianDigits(reportSummary.overdueCount)} مورد</span>
              </div>
            </div>

            <div className="p-4 bg-black/40 rounded-2xl border border-[#222] text-[11px] text-gray-400 leading-relaxed font-sans">
              <span className="font-bold text-gray-200 block mb-1">توضیحات ایمیل خودکار مدیریتی:</span>
              «گزارش وصول مطالبات دوره مالی با مهر دیجیتال رمزگذاری شده و خلاصه عملکرد کارمندان ثبت‌نام تقدیم حضور می‌گردد.»
            </div>
          </div>

          <div className="pt-4 border-t border-[#222]">
            {isSendingReport ? (
              <div className="flex items-center justify-center gap-2 py-2 text-xs text-amber-500 font-bold">
                <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                در حال بسته‌بندی داده‌ها و ارسال از درگاه SMTP ایمن...
              </div>
            ) : reportSuccess ? (
              <div className="flex items-center justify-center gap-2 py-2.5 bg-emerald-500/10 text-emerald-500 text-xs font-bold rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" />
                گزارش با موفقیت به صندوق مدیران ارشد ارسال شد!
              </div>
            ) : (
              <button
                onClick={handleSendExecutiveReport}
                className="w-full text-center py-2.5 bg-[#111] hover:bg-[#1a1a1a] border border-[#222] text-amber-500 font-bold text-xs rounded-full transition-all cursor-pointer"
              >
                ارسال خلاصه وضعیت هم‌اکنون (تست ایمیل)
              </button>
            )}
          </div>
        </div>

        {/* Live Audit Ledger */}
        <div className="lg:col-span-2 bg-[#0d0d0d] border border-[#222] rounded-3xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 bg-[#111] border-b border-[#222] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <span className="font-bold text-xs text-amber-500">شجره‌نامه عملیاتی و لاگ امنیت سیستم</span>
              
              <div className="flex gap-2 w-full sm:w-auto">
                {/* Search */}
                <input
                  type="text"
                  placeholder="جستجو در لاگ‌ها..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1 bg-black border border-[#222] rounded-full text-xs text-gray-300 placeholder-gray-600 focus:outline-none"
                />

                {/* Filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-1 bg-black border border-[#222] rounded-full text-xs text-gray-300 focus:outline-none cursor-pointer appearance-none text-center"
                >
                  <option value="all">همه نقش‌ها</option>
                  <option value="admin">مدیر ارشد</option>
                  <option value="finance">مدیر مالی</option>
                  <option value="employee">کارشناس ثبت‌نام</option>
                </select>
              </div>
            </div>

            {/* Logs list */}
            <div className="divide-y divide-[#222]/50 text-[11px] max-h-[340px] overflow-y-auto">
              {filteredLogs.map((log) => {
                let roleColor = 'text-amber-500 bg-amber-500/5 border-amber-500/10';
                let roleText = 'کارشناس';
                if (log.role === 'admin') {
                  roleColor = 'text-rose-500 bg-rose-500/5 border-rose-500/10';
                  roleText = 'مدیر ارشد';
                } else if (log.role === 'finance') {
                  roleColor = 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10';
                  roleText = 'مدیر مالی';
                }

                return (
                  <div key={log.id} className="p-3.5 hover:bg-white/5 transition-colors flex flex-col sm:flex-row justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{log.userName}</span>
                        <span className={`px-2 py-0.5 border rounded-full text-[9px] font-bold ${roleColor}`}>
                          {roleText}
                        </span>
                        <span className="text-gray-500 font-mono text-[9px]">{toPersianDigits(log.timestamp)}</span>
                      </div>
                      <p className="text-gray-300 text-xs font-sans">{log.details}</p>
                    </div>
                    <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                      <span className="font-bold text-amber-500/90 font-mono text-[10px] bg-amber-500/5 px-2.5 py-0.5 rounded-full border border-amber-500/10">
                        {log.action}
                      </span>
                      <span className="text-gray-600 text-[9px] font-mono">IP: {log.ipAddress}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
