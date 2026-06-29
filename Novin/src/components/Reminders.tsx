/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Send,
  Sliders,
  Check,
  RefreshCw,
  Search,
  Key,
  Hash,
  Eye,
  EyeOff,
  Info,
  BookOpen,
  Cpu,
  Globe,
} from 'lucide-react';
import { ReminderLog, Student, Installment, FarazSmsConfig } from '../types';
import { toPersianDigits } from '../utils';

interface RemindersProps {
  reminders: ReminderLog[];
  students: Student[];
  installments: Installment[];
  onTriggerManualSMS: (studentId: string, installmentId: string) => void;
  onSimulateDailyCheck: () => void;
  farazSmsConfig: FarazSmsConfig;
  onSaveFarazSmsConfig: (newConfig: FarazSmsConfig) => void;
}

export default function Reminders({
  reminders,
  students,
  installments,
  onTriggerManualSMS,
  onSimulateDailyCheck,
  farazSmsConfig,
  onSaveFarazSmsConfig,
}: RemindersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSimulatingSMS, setIsSimulatingSMS] = useState(false);

  // Faraz SMS config local states
  const [smsEnabled, setSmsEnabled] = useState(farazSmsConfig.enabled);
  const [apiKey, setApiKey] = useState(farazSmsConfig.apiKey);
  const [sender, setSender] = useState(farazSmsConfig.sender);
  const [patternCode, setPatternCode] = useState(farazSmsConfig.patternCode);
  const [varName, setVarName] = useState(farazSmsConfig.varName || 'name');
  const [varAmount, setVarAmount] = useState(farazSmsConfig.varAmount || 'amount');
  const [varDate, setVarDate] = useState(farazSmsConfig.varDate || 'date');
  const [varCourse, setVarCourse] = useState(farazSmsConfig.varCourse || 'course');
  const [showApiKey, setShowApiKey] = useState(false);

  React.useEffect(() => {
    setSmsEnabled(farazSmsConfig.enabled);
    setApiKey(farazSmsConfig.apiKey);
    setSender(farazSmsConfig.sender);
    setPatternCode(farazSmsConfig.patternCode);
    setVarName(farazSmsConfig.varName || 'name');
    setVarAmount(farazSmsConfig.varAmount || 'amount');
    setVarDate(farazSmsConfig.varDate || 'date');
    setVarCourse(farazSmsConfig.varCourse || 'course');
  }, [farazSmsConfig]);

  const handleSaveSmsSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveFarazSmsConfig({
      enabled: smsEnabled,
      apiKey: apiKey.trim(),
      sender: sender.trim(),
      patternCode: patternCode.trim(),
      varName: varName.trim(),
      varAmount: varAmount.trim(),
      varDate: varDate.trim(),
      varCourse: varCourse.trim()
    });
  };

  // Settings for auto notifications
  const [notify3DaysBefore, setNotify3DaysBefore] = useState(true);
  const [notifyOnOverdue, setNotifyOnOverdue] = useState(true);
  const [notifyWeeklyManager, setNotifyWeeklyManager] = useState(true);

  // Filter pending/overdue installments to send reminders manually
  const remindableInstallments = React.useMemo(() => {
    return installments
      .filter((inst) => inst.status !== 'paid')
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

  // Filter reminders history
  const filteredReminders = React.useMemo(() => {
    return reminders.filter((rem) => {
      return (
        rem.studentName.includes(searchTerm) ||
        rem.studentPhone.includes(searchTerm) ||
        rem.message.includes(searchTerm)
      );
    });
  }, [reminders, searchTerm]);

  const handleSimulateDailyRun = () => {
    setIsSimulatingSMS(true);
    onSimulateDailyCheck();
    setTimeout(() => {
      setIsSimulatingSMS(false);
    }, 1000);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Header Card */}
      <div className="bg-[#0d0d0d] p-6 rounded-3xl border border-[#222]">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-500" />
              اتوماسیون پیگیری و هشدارهای پیامکی هوشمند
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              مجموعه هشدارهای پیشرفته پیامکی، سیستم یادآور خودکار سررسیدها و پایش روزانه وضعیت وصول مطالبات
            </p>
          </div>
          <button
            onClick={handleSimulateDailyRun}
            disabled={isSimulatingSMS}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-800 text-black font-bold text-xs rounded-full cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${isSimulatingSMS ? 'animate-spin' : ''}`} />
            اجرای دستی اتوماسیون پایش روزانه (Simulate Daily Check)
          </button>
        </div>
      </div>

      {/* Grid: Settings on Right, Manual SMS triggers on Left */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings column */}
        <div className="bg-[#0d0d0d] border border-[#222] p-6 rounded-3xl space-y-6">
          <h4 className="text-xs font-bold text-amber-500 flex items-center gap-2 border-b border-[#222] pb-3">
            <Sliders className="w-4 h-4" />
            تنظیمات قوانین اعلان هوشمند
          </h4>

          {/* Setting 1 */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="before"
              checked={notify3DaysBefore}
              onChange={() => setNotify3DaysBefore(!notify3DaysBefore)}
              className="mt-1 w-4 h-4 text-amber-500 border-gray-800 rounded focus:ring-amber-500 cursor-pointer accent-amber-500"
            />
            <label htmlFor="before" className="text-xs text-gray-400 cursor-pointer select-none">
              <span className="font-bold text-white block">ارسال پیامک یادآوری قبل از سررسید</span>
              بررسی روزانه برای ارسال اتوماتیک پیامک ۳ روز پیش از زمان دقیق سررسید به تلفن دانشجو.
            </label>
          </div>

          {/* Setting 2 */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="overdueNotify"
              checked={notifyOnOverdue}
              onChange={() => setNotifyOnOverdue(!notifyOnOverdue)}
              className="mt-1 w-4 h-4 text-amber-500 border-gray-800 rounded focus:ring-amber-500 cursor-pointer accent-amber-500"
            />
            <label htmlFor="overdueNotify" className="text-xs text-gray-400 cursor-pointer select-none">
              <span className="font-bold text-white block">اعلان فوری دیرکرد قسط (معوقه)</span>
              ارسال پیامک هشدار با لحن تذکر مقتضی به صورت مستقیم پس از رد شدن مهلت پرداخت.
            </label>
          </div>

          {/* Setting 3 */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="weeklyManager"
              checked={notifyWeeklyManager}
              onChange={() => setNotifyWeeklyManager(!notifyWeeklyManager)}
              className="mt-1 w-4 h-4 text-amber-500 border-gray-800 rounded focus:ring-amber-500 cursor-pointer accent-amber-500"
            />
            <label htmlFor="weeklyManager" className="text-xs text-gray-400 cursor-pointer select-none">
              <span className="font-bold text-white block">ارسال گزارش وصولی به مدیریت ارشد</span>
              ارسال خلاصه وضعیت دریافتی‌ها و میزان بدهکاران به ایمیل و پیامک مدیران ارشد در پایان هفته.
            </label>
          </div>

          {/* Current system status box */}
          <div className="bg-black/40 p-4 rounded-2xl border border-[#222] space-y-2">
            <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
              سامانه فعال است
            </span>
            <p className="text-xs text-gray-500 leading-relaxed pt-1 font-sans">
              موتور ارسال پیامک به درگاه مخابراتی متصل است و پایش سررسیدها هر ساعت به صورت سیستماتیک و بدون دخالت دست انجام می‌شود.
            </p>
          </div>
        </div>

        {/* Manual triggers column */}
        <div className="lg:col-span-2 bg-[#0d0d0d] border border-[#222] p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-white mb-4 flex items-center gap-2 border-b border-[#222] pb-3">
              <Send className="w-4 h-4 text-amber-500" />
              ارسال فوری پیامک یادآوری پرداخت
            </h4>
            
            <div className="overflow-y-auto max-h-[300px] divide-y divide-[#222]/50 pr-1 text-xs">
              {remindableInstallments.map((inst, index) => (
                <div key={index} className="py-3 flex justify-between items-center hover:bg-white/5 rounded-2xl px-3 transition-all">
                  <div className="space-y-1">
                    <p className="font-bold text-white">{inst.studentName}</p>
                    <p className="text-gray-500 text-[10px]">{inst.course}</p>
                    <p className="text-gray-600 font-mono text-[10px]">
                      تلفن: {toPersianDigits(inst.phone)} | سررسید: {toPersianDigits(inst.dueDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      inst.status === 'overdue' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      {inst.status === 'overdue' ? 'معوقه' : 'در انتظار'}
                    </span>
                    <button
                      onClick={() => onTriggerManualSMS(inst.studentId, inst.id)}
                      className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 font-bold rounded-full text-[10px] transition-all cursor-pointer"
                    >
                      ارسال یادآور
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Faraz SMS (IPPanel) Configuration Section */}
      <div className="bg-[#0d0d0d] border border-[#222] rounded-3xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#222] pb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-amber-500" />
              فعال‌سازی درگاه پیامک واقعی (Faraz SMS / IPPanel)
            </h3>
            <p className="text-xs text-gray-500 mt-1 font-sans">
              تنظیمات اتصال سیستم به سامانه مخابراتی فراز اس‌ام‌اس جهت ارسال یادآوری‌های واقعی از طریق وب‌سرویس پترن (کاهش بلک‌لیست)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">وضعیت درگاه پیامک واقعی:</span>
            <button
              type="button"
              onClick={() => {
                const updatedEnabled = !smsEnabled;
                setSmsEnabled(updatedEnabled);
                onSaveFarazSmsConfig({
                  enabled: updatedEnabled,
                  apiKey,
                  sender,
                  patternCode,
                  varName,
                  varAmount,
                  varDate,
                  varCourse
                });
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                smsEnabled ? 'bg-amber-500' : 'bg-[#222]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                  smsEnabled ? '-translate-x-6' : '-translate-x-1'
                }`}
              />
            </button>
            <span className={`text-xs font-bold ${smsEnabled ? 'text-amber-500' : 'text-gray-500'}`}>
              {smsEnabled ? 'فعال (واقعی)' : 'غیرفعال (شبیه‌ساز)'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Settings Form Column */}
          <form onSubmit={handleSaveSmsSettings} className="lg:col-span-3 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* API Key */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 block flex justify-between">
                  <span>کلید API (API Key)</span>
                  <span className="text-amber-500/80 font-normal">کلید دسترسی امنیتی پنل فراز</span>
                </label>
                <div className="relative">
                  <Key className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4" />
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="API Key خود را وارد کنید..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full pl-10 pr-9 py-2 bg-black border border-[#222] rounded-xl text-xs text-gray-300 focus:outline-none focus:border-amber-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Sender Line */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 block">شماره خط فرستنده (Sender)</label>
                <div className="relative">
                  <Hash className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="مانند 3000505"
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 bg-black border border-[#222] rounded-xl text-xs text-gray-300 text-left font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              {/* Pattern Code */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 block">کد الگوی ثبت‌شده (Pattern Code)</label>
                <div className="relative">
                  <Hash className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="مثال: 83419"
                    value={patternCode}
                    onChange={(e) => setPatternCode(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 bg-black border border-[#222] rounded-xl text-xs text-gray-300 text-left font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Parameter mapping */}
            <div className="bg-black/30 p-4 rounded-2xl border border-[#222] space-y-3">
              <span className="text-[10px] text-amber-500/80 font-bold block border-b border-[#222]/80 pb-1.5">
                نگاشت متغیرهای الگو (Pattern Variables Map)
              </span>
              <p className="text-[10px] text-gray-500 font-sans">
                نام متغیرهایی که در قالب متنی خود در فراز اس‌ام‌اس ثبت کرده‌اید را در اینجا مشخص کنید تا سیستم مقادیر را دقیقاً به همان متغیرها ارسال کند.
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Var name */}
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 font-medium block">نام دانشجو (مقدار پیش‌فرض: {varName})</span>
                  <input
                    type="text"
                    value={varName}
                    onChange={(e) => setVarName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-black border border-[#222] rounded-lg text-xs text-amber-500 text-center font-mono focus:outline-none"
                    placeholder="نام متغیر"
                  />
                </div>

                {/* Var amount */}
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 font-medium block">مبلغ قسط (مقدار پیش‌فرض: {varAmount})</span>
                  <input
                    type="text"
                    value={varAmount}
                    onChange={(e) => setVarAmount(e.target.value)}
                    className="w-full px-3 py-1.5 bg-black border border-[#222] rounded-lg text-xs text-amber-500 text-center font-mono focus:outline-none"
                    placeholder="نام متغیر"
                  />
                </div>

                {/* Var date */}
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 font-medium block">تاریخ سررسید (مقدار پیش‌فرض: {varDate})</span>
                  <input
                    type="text"
                    value={varDate}
                    onChange={(e) => setVarDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-black border border-[#222] rounded-lg text-xs text-amber-500 text-center font-mono focus:outline-none"
                    placeholder="نام متغیر"
                  />
                </div>

                {/* Var course */}
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 font-medium block">عنوان دوره (مقدار پیش‌فرض: {varCourse})</span>
                  <input
                    type="text"
                    value={varCourse}
                    onChange={(e) => setVarCourse(e.target.value)}
                    className="w-full px-3 py-1.5 bg-black border border-[#222] rounded-lg text-xs text-amber-500 text-center font-mono focus:outline-none"
                    placeholder="نام متغیر"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg"
            >
              ذخیره تغییرات و اعمال تنظیمات درگاه پیامکی
            </button>
          </form>

          {/* Guidelines Column */}
          <div className="lg:col-span-2 bg-[#111]/40 border border-[#222] p-5 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-white flex items-center gap-2 border-b border-[#222] pb-2">
              <BookOpen className="w-4 h-4 text-amber-500" />
              راهنمای دریافت مقادیر از پنل فراز اس‌ام‌اس
            </h4>

            <div className="space-y-3.5 text-[11px] text-gray-400 leading-relaxed font-sans">
              <div>
                <p className="font-bold text-white flex items-center gap-1.5 mb-1 text-[12px]">
                  <span className="w-4 h-4 bg-[#222] text-amber-500 rounded-full flex items-center justify-center font-mono text-[10px]">۱</span>
                  دریافت کلید API (API Key)
                </p>
                <p className="pr-5 font-sans leading-normal">
                  وارد پنل کاربری خود در <span className="text-amber-500">ippanel.com</span> شوید. از منوی سمت راست وارد بخش <span className="text-white">«پشتیبانی و اطلاعات کاربری»</span> شده و سپس تب <span className="text-white">«کلید API»</span> را باز کنید. روی دکمه تولید کلید جدید کلیک کرده و کلید هگزادسیمال ایجاد شده را کپی کنید.
                </p>
              </div>

              <div>
                <p className="font-bold text-white flex items-center gap-1.5 mb-1 text-[12px]">
                  <span className="w-4 h-4 bg-[#222] text-amber-500 rounded-full flex items-center justify-center font-mono text-[10px]">۲</span>
                  دریافت شماره فرستنده (Sender)
                </p>
                <p className="pr-5 font-sans leading-normal">
                  شماره فرستنده پیامک که از طرف پنل به شما اختصاص یافته است. برای ارسال‌های وب‌سرویس معمولاً از خط عمومی خدماتی پنل فراز مانند <span className="text-white font-mono text-xs">3000505</span> یا شماره اختصاصی خود که در گوشه بالایی پنل نشان داده می‌شود استفاده کنید.
                </p>
              </div>

              <div>
                <p className="font-bold text-white flex items-center gap-1.5 mb-1 text-[12px]">
                  <span className="w-4 h-4 bg-[#222] text-amber-500 rounded-full flex items-center justify-center font-mono text-[10px]">۳</span>
                  ثبت الگو و دریافت کد الگو (Pattern)
                </p>
                <p className="pr-5 font-sans leading-normal">
                  به بخش <span className="text-white">«ارسال بر اساس پترن»</span> (یا بخش وب‌سرویس الگوها) بروید. یک الگوی جدید ثبت کنید. متن الگو باید متغیرهای شما را داشته باشد:
                  <br />
                  <span className="bg-black text-gray-300 font-mono text-[10px] block p-2 rounded-lg mt-1.5 border border-[#222] text-right" dir="ltr">
                    %{varName}% گرامی، یادآوری می‌گردد سررسید قسط شما به مبلغ %{varAmount}% ریال در تاریخ %{varDate}% برای دوره %{varCourse}% فرا رسیده است. نسبت به تسویه اقدام فرمایید.
                  </span>
                  پس از تایید الگو توسط ناظر فراز، یک <span className="text-amber-500 font-bold">کد الگوی عددی</span> صادر می‌شود که باید آن را در کادر کد الگو قرار دهید.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History log of sent reminders */}
      <div className="bg-[#0d0d0d] border border-[#222] rounded-3xl overflow-hidden">
        <div className="p-4 bg-[#111] border-b border-[#222] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <span className="font-bold text-xs text-amber-500">تاریخچه پیامک‌های ارسالی و برنامه‌ریزی شده</span>
          <div className="relative w-full sm:w-64 mt-2 sm:mt-0">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="جستجو در پیام‌ها..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-9 py-1.5 bg-black border border-[#222] rounded-full text-xs text-gray-300 placeholder-gray-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="divide-y divide-[#222]/50 text-xs">
          {filteredReminders.length === 0 ? (
            <div className="p-8 text-center text-gray-600">تاریخچه ارسال پیامکی خالی است.</div>
          ) : (
            filteredReminders.map((rem) => (
              <div key={rem.id} className="p-4 hover:bg-white/5 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{rem.studentName}</span>
                    <span className="text-gray-500 font-mono text-[10px]">({toPersianDigits(rem.studentPhone)})</span>
                  </div>
                  <p className="text-gray-300 text-[11px] leading-relaxed bg-[#111] p-3 rounded-2xl border border-[#222] font-sans">
                    {toPersianDigits(rem.message)}
                  </p>
                </div>
                <div className="text-right flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    rem.status === 'sent' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    {rem.status === 'sent' ? 'ارسال شده' : 'برنامه‌ریزی شده'}
                  </span>
                  <p className="text-gray-500 text-[10px] font-mono">
                    {rem.sentTime ? `ارسال: ${toPersianDigits(rem.sentTime)}` : `زمان‌بندی: ${toPersianDigits(rem.scheduledTime)}`}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
