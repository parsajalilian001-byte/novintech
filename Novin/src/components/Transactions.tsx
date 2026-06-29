/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard,
  Plus,
  Search,
  FileSpreadsheet,
  Printer,
  Calendar,
  CheckCircle2,
  DollarSign,
  User,
  Hash,
  Activity,
  ArrowDownLeft,
  X,
  FileCheck,
  ChevronDown,
} from 'lucide-react';
import { Student, Installment, Transaction, UserRole } from '../types';
import { formatRial, toPersianDigits, exportToCSV } from '../utils';

interface TransactionsProps {
  students: Student[];
  installments: Installment[];
  transactions: Transaction[];
  onAddTransaction: (studentId: string, installmentId: string, payload: {
    amount: number;
    paymentMethod: 'نقدی' | 'کارت به کارت' | 'درگاه بانکی' | 'چک';
    referenceCode: string;
  }) => void;
  currentUserRole: UserRole;
  isQuickRecording: boolean;
  quickRecordData: { studentId: string; installmentId: string } | null;
  onCloseQuickRecord: () => void;
}

export default function Transactions({
  students,
  installments,
  transactions,
  onAddTransaction,
  currentUserRole,
  isQuickRecording,
  quickRecordData,
  onCloseQuickRecord,
}: TransactionsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [isRecording, setIsRecording] = useState(false);

  // Form states
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedInstallmentId, setSelectedInstallmentId] = useState('');
  const [payMethod, setPayMethod] = useState<'نقدی' | 'کارت به کارت' | 'درگاه بانکی' | 'چک'>('کارت به کارت');
  const [refCode, setRefCode] = useState('');
  const [customAmount, setCustomAmount] = useState<number>(0);

  // Trigger recording modal manually
  const handleOpenRecordModal = () => {
    setIsRecording(true);
    setSelectedStudentId('');
    setSelectedInstallmentId('');
    setRefCode(`Ref-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  // If quick recording is active, we prepopulate form
  React.useEffect(() => {
    if (isQuickRecording && quickRecordData) {
      setSelectedStudentId(quickRecordData.studentId);
      setSelectedInstallmentId(quickRecordData.installmentId);
      
      const targetInst = installments.find((i) => i.id === quickRecordData.installmentId);
      if (targetInst) {
        setCustomAmount(targetInst.amount);
      }
      setRefCode(`Ref-${Math.floor(100000 + Math.random() * 900000)}`);
      setIsRecording(true);
    }
  }, [isQuickRecording, quickRecordData, installments]);

  const activeInstallmentsOptions = useMemo(() => {
    if (!selectedStudentId) return [];
    return installments.filter((i) => i.studentId === selectedStudentId && i.status !== 'paid');
  }, [selectedStudentId, installments]);

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
    setSelectedInstallmentId('');
    const studentInsts = installments.filter((i) => i.studentId === studentId && i.status !== 'paid');
    if (studentInsts.length > 0) {
      setSelectedInstallmentId(studentInsts[0].id);
      setCustomAmount(studentInsts[0].amount);
    } else {
      setCustomAmount(0);
    }
  };

  const handleInstallmentSelect = (installmentId: string) => {
    setSelectedInstallmentId(installmentId);
    const target = installments.find((i) => i.id === installmentId);
    if (target) {
      setCustomAmount(target.amount);
    }
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedInstallmentId || !customAmount) {
      alert('لطفاً همه‌ی فیلدها را به دقت انتخاب کنید.');
      return;
    }

    onAddTransaction(selectedStudentId, selectedInstallmentId, {
      amount: customAmount,
      paymentMethod: payMethod,
      referenceCode: refCode || `TRX-${Date.now().toString().slice(-6)}`,
    });

    setIsRecording(false);
    onCloseQuickRecord();
  };

  // Filter and search transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const student = students.find((s) => s.id === tx.studentId);
      const studentName = student?.name || 'نامشخص';
      
      const matchesSearch =
        studentName.includes(searchQuery) ||
        tx.referenceCode.includes(searchQuery) ||
        tx.recordedBy.includes(searchQuery);

      const matchesMethod = methodFilter === 'all' || tx.paymentMethod === methodFilter;

      return matchesSearch && matchesMethod;
    });
  }, [transactions, students, searchQuery, methodFilter]);

  const handleExportTransactions = () => {
    const list = filteredTransactions.map((tx) => {
      const student = students.find((s) => s.id === tx.studentId);
      return {
        'شناسه واریزی': tx.id,
        'نام دانشجو': student?.name || 'نامشخص',
        'مبلغ دریافتی (ریال)': tx.amount,
        'روش پرداخت': tx.paymentMethod,
        'شماره پیگیری': tx.referenceCode,
        'ثبت‌کننده': tx.recordedBy,
        'تاریخ ثبت': tx.date,
      };
    });
    exportToCSV(list, 'تاریخچه_تراکنش‌های_مالی_نوین_تک', [
      'شناسه واریزی',
      'نام دانشجو',
      'مبلغ دریافتی (ریال)',
      'روش پرداخت',
      'شماره پیگیری',
      'ثبت‌کننده',
      'تاریخ ثبت',
    ]);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0d0d0d] p-6 rounded-3xl border border-[#222]">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-500" />
            دفتر کل ثبت تراکنش‌ها و اسناد مالی
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            شفافیت در کلیه درآمدهای واصل‌شده، ثبت شناسه پیگیری‌های تراکنش‌های بانکی، چک‌ها و پرداخت‌های نقدی
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleOpenRecordModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-full transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.25)]"
          >
            <Plus className="w-4 h-4" />
            ثبت وصول واریزی جدید
          </button>
          <button
            onClick={handleExportTransactions}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#111] hover:bg-[#1a1a1a] border border-[#333] text-gray-300 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            خروجی اکسل
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="جستجو بر اساس نام دانشجو، شماره پیگیری یا ثبت‌کننده..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-11 py-2.5 bg-[#0d0d0d] border border-[#222] rounded-full text-sm text-[#e0e0e0] placeholder-gray-600 focus:outline-none focus:border-amber-500/30 transition-all font-sans"
          />
        </div>
        {/* Payment Method Filter */}
        <div className="relative">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="w-full px-5 py-2.5 bg-[#0d0d0d] border border-[#222] rounded-full text-sm text-[#e0e0e0] focus:outline-none focus:border-amber-500/30 transition-all appearance-none cursor-pointer font-sans"
          >
            <option value="all">همه روش‌های پرداخت</option>
            <option value="کارت به کارت">کارت به کارت</option>
            <option value="درگاه بانکی">درگاه بانکی</option>
            <option value="نقدی">نقدی</option>
            <option value="چک">چک</option>
          </select>
          <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
        </div>
      </div>

      {/* Transactions History Table */}
      <div className="bg-[#0d0d0d] border border-[#222] rounded-3xl overflow-hidden">
        <div className="p-4 bg-[#111] border-b border-[#222] font-bold text-xs text-emerald-500">
          تراکنش‌های وصول‌شده ({toPersianDigits(filteredTransactions.length)} تراکنش)
        </div>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-gray-600 text-sm">
            <CreditCard className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            هیچ تراکنشی یافت نشد.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#222] text-gray-500">
                  <th className="p-4 font-semibold">شناسه تراکنش</th>
                  <th className="p-4 font-semibold">نام دانشجو</th>
                  <th className="p-4 font-semibold">مبلغ وصولی</th>
                  <th className="p-4 font-semibold">روش پرداخت</th>
                  <th className="p-4 font-semibold">کد پیگیری</th>
                  <th className="p-4 font-semibold">ثبت‌کننده</th>
                  <th className="p-4 font-semibold">تاریخ و زمان ثبت</th>
                  <th className="p-4 font-semibold text-center">وضعیت سند</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]/50">
                {filteredTransactions.map((tx) => {
                  const student = students.find((s) => s.id === tx.studentId);
                  return (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-gray-600 font-mono">#{tx.id}</td>
                      <td className="p-4 font-semibold text-white">{student?.name || 'نامشخص'}</td>
                      <td className="p-4 text-emerald-500 font-bold font-mono">{formatRial(tx.amount)}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-white/5 text-gray-300 border border-[#222] rounded-full text-[10px] font-bold">
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td className="p-4 text-gray-300 font-mono font-medium">{toPersianDigits(tx.referenceCode)}</td>
                      <td className="p-4 text-gray-500">{tx.recordedBy}</td>
                      <td className="p-4 text-gray-500 font-mono">{toPersianDigits(tx.date)}</td>
                      <td className="p-4 text-center">
                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-full text-[10px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          تأیید شد
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {isRecording && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0d0d0d] border border-[#222] rounded-3xl p-6 sm:p-8 w-full max-w-md text-right shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-[#222] pb-4 mb-6">
                <h3 className="text-md font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-500" />
                  ثبت رسمی وصول نقدی / سند بانکی
                </h3>
                <button
                  onClick={() => {
                    setIsRecording(false);
                    onCloseQuickRecord();
                  }}
                  className="p-1 text-gray-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitPayment} className="space-y-4">
                {/* Select Student */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500">دانشجو *</label>
                  <select
                    required
                    value={selectedStudentId}
                    onChange={(e) => handleStudentSelect(e.target.value)}
                    disabled={isQuickRecording}
                    className="w-full px-4 py-2.5 bg-[#111] border border-[#222] rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/30 cursor-pointer disabled:opacity-50 appearance-none font-sans"
                  >
                    <option value="">انتخاب دانشجو...</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name} ({student.courseName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Installment */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500">بند قسط معلق *</label>
                  <select
                    required
                    value={selectedInstallmentId}
                    onChange={(e) => handleInstallmentSelect(e.target.value)}
                    disabled={isQuickRecording}
                    className="w-full px-4 py-2.5 bg-[#111] border border-[#222] rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/30 cursor-pointer disabled:opacity-50 appearance-none font-sans"
                  >
                    <option value="">ابتدا دانشجو را انتخاب کنید...</option>
                    {activeInstallmentsOptions.map((inst, index) => (
                      <option key={inst.id} value={inst.id}>
                        قسط معلق - مبلغ {formatRial(inst.amount)} (سررسید: {inst.dueDate})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500">مبلغ واریز شده (ریال) *</label>
                  <input
                    type="number"
                    required
                    value={customAmount}
                    onChange={(e) => setCustomAmount(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-[#111] border border-[#222] rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-500/30"
                  />
                  <p className="text-[10px] text-gray-500">{formatRial(customAmount)}</p>
                </div>

                {/* Payment Method */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500">روش پرداخت *</label>
                  <select
                    value={payMethod}
                    onChange={(e: any) => setPayMethod(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#111] border border-[#222] rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/30 cursor-pointer appearance-none font-sans"
                  >
                    <option value="کارت به کارت">کارت به کارت</option>
                    <option value="درگاه بانکی">درگاه بانکی</option>
                    <option value="نقدی">نقدی</option>
                    <option value="چک">چک</option>
                  </select>
                </div>

                {/* Reference Code */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500">کد پیگیری تراکنش / شماره سند *</label>
                  <input
                    type="text"
                    required
                    value={refCode}
                    onChange={(e) => setRefCode(e.target.value)}
                    placeholder="مانند: Ref-392019"
                    className="w-full px-4 py-2.5 bg-[#111] border border-[#222] rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-500/30"
                  />
                </div>

                <div className="border-t border-[#222] pt-5 flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRecording(false);
                      onCloseQuickRecord();
                    }}
                    className="px-4 py-2 bg-[#111] hover:bg-[#1a1a1a] text-gray-400 rounded-full text-xs font-bold transition-all cursor-pointer"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full text-xs font-bold shadow-lg shadow-emerald-500/15 transition-all cursor-pointer"
                  >
                    ثبت و تایید وصول سند
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
