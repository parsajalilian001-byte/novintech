/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Send,
  Copy,
  Check,
  MessageSquare,
  AlertCircle,
  Eye,
  EyeOff,
  HelpCircle,
  FileText,
  Users,
  TrendingDown,
  Info
} from 'lucide-react';
import { Student } from '../types';
import { toPersianDigits } from '../utils';

const formatToman = (amount: number): string => {
  return toPersianDigits(amount.toLocaleString('en-US'));
};

interface BaleIntegrationProps {
  students: Student[];
}

export default function BaleIntegration({ students }: BaleIntegrationProps) {
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [botToken, setBotToken] = useState<string>('');
  const [chatId, setChatId] = useState<string>('');
  const [showToken, setShowToken] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | ''; text: string }>({ type: '', text: '' });

  // Get unique course names from student records
  const uniqueCourses = Array.from(new Set(students.map((s) => s.courseName))).filter(Boolean);

  // Set default course when courses change
  useEffect(() => {
    if (uniqueCourses.length > 0 && !selectedCourse) {
      setSelectedCourse(uniqueCourses[0]);
    }
  }, [students]);

  // Load Bot Token and Chat ID from localStorage if exists
  useEffect(() => {
    const savedToken = localStorage.getItem('zarrin_bale_token');
    const savedChatId = localStorage.getItem('zarrin_bale_chat_id');
    if (savedToken) setBotToken(savedToken);
    if (savedChatId) setChatId(savedChatId);
  }, []);

  // Save config to localStorage when updated
  const saveConfig = (token: string, chat: string) => {
    localStorage.setItem('zarrin_bale_token', token);
    localStorage.setItem('zarrin_bale_chat_id', chat);
  };

  // Filter students by selected course
  const courseStudents = students.filter((s) => s.courseName === selectedCourse);

  // Calculate stats for selected course
  const totalStudents = courseStudents.length;
  const debtors = courseStudents.filter((s) => s.remainingAmount > 0);
  const totalRemainingDebt = debtors.reduce((sum, s) => sum + s.remainingAmount, 0);

  // Generate Persian text report
  const generateReportText = (): string => {
    if (!selectedCourse) return 'هیچ دوره‌ای انتخاب نشده است.';
    
    const today = new Date().toLocaleDateString('fa-IR');
    let report = `📊 گزارش مانده بدهی دوره: ${selectedCourse}\n`;
    report += `📅 تاریخ گزارش: ${today}\n`;
    report += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    if (debtors.length === 0) {
      report += `✅ خوشبختانه تمامی هنرجویان این دوره تسویه حساب کامل کرده‌اند و فاقد هرگونه بدهی می‌باشند.\n`;
    } else {
      debtors.forEach((s, idx) => {
        const paidAmount = s.totalAmount - s.remainingAmount;
        report += `${toPersianDigits(idx + 1)}. 👤 هنرجو: ${s.name}\n`;
        report += `   💵 شهریه کل: ${formatToman(s.totalAmount)} تومان\n`;
        report += `   💳 پرداخت شده: ${formatToman(paidAmount)} تومان\n`;
        report += `   🔴 مانده بدهی: ${formatToman(s.remainingAmount)} تومان\n`;
        report += `   -----------------------------\n`;
      });

      report += `\n💰 مجموع کل بدهی این دوره: ${formatToman(totalRemainingDebt)} تومان\n\n`;
      report += `📌 هنرجویان محترم فوق، لطفا در اسرع وقت نسبت به تسویه اقساط معوقه خود اقدام فرمایید. با تشکر.`;
    }

    return report;
  };

  const handleCopy = () => {
    const text = generateReportText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToBale = async () => {
    setStatusMsg({ type: '', text: '' });

    if (!botToken.trim()) {
      setStatusMsg({ type: 'error', text: 'لطفاً توکن بات بله را وارد نمایید.' });
      return;
    }
    if (!chatId.trim()) {
      setStatusMsg({ type: 'error', text: 'لطفاً شناسه گروه یا کانال بله را وارد نمایید.' });
      return;
    }

    // Save configuration
    saveConfig(botToken.trim(), chatId.trim());
    setIsSending(true);

    try {
      const reportText = generateReportText();
      
      // Use our secure server-side Express proxy to avoid CORS/Failed to fetch browser restrictions
      const response = await fetch('/api/bale/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botToken: botToken.trim(),
          chat_id: chatId.trim(),
          text: reportText,
        }),
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        setStatusMsg({
          type: 'success',
          text: '✅ گزارش مانده بدهی با موفقیت به گروه پیام‌رسان بله ارسال شد!',
        });
      } else {
        setStatusMsg({
          type: 'error',
          text: `❌ خطا در ارسال به بله: ${data.description || 'پاسخ نامعتبر از سرور بله'}`,
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMsg({
        type: 'error',
        text: '❌ خطا در برقراری ارتباط با پیام‌رسان بله. لطفاً توکن و شناسه را بررسی نمایید، یا متن گزارش را کپی کرده و به صورت دستی بفرستید.',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 select-none" dir="rtl">
      {/* Introduction Card */}
      <div className="bg-[#0d0d0d] p-6 rounded-3xl border border-[#222] space-y-2">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <Send className="w-5 h-5 text-amber-500" />
          اتصال و ارسال خودکار گزارش به پیام‌رسان بله
        </h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          در این بخش می‌توانید به سادگی مانده بدهی تمامی هنرجویان یک دوره مشخص را به صورت خودکار محاسبه کرده، گزارش متنی شکیل تحویل بگیرید و آن را به صورت مستقیم از طریق بازوی بله (Bale Bot) به گروه یا کانال کلاسی خود ارسال فرمایید. همچنین امکان کپی سریع متن جهت جایگذاری دستی مهیا می‌باشد.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Side: Report Generator Controls & Integration Config */}
        <div className="xl:col-span-1 space-y-6">
          {/* Section 1: Select Course */}
          <div className="bg-[#0d0d0d] p-5 rounded-3xl border border-[#222] space-y-4">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              تنظیمات فیلتر گزارش دوره
            </span>

            <div>
              <label className="text-[10px] text-gray-400 block mb-1.5">دوره آموزشی مورد نظر:</label>
              {uniqueCourses.length === 0 ? (
                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-center text-xs text-amber-500">
                  هیچ دوره یا پرونده دانش‌آموزی در سیستم ثبت نشده است.
                </div>
              ) : (
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black border border-[#222] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {uniqueCourses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedCourse && (
              <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                <div className="p-2.5 bg-black rounded-xl border border-[#222]">
                  <span className="text-[9px] text-gray-500 block">کل هنرجویان</span>
                  <span className="text-xs font-bold text-white mt-1 block">
                    {toPersianDigits(totalStudents)} نفر
                  </span>
                </div>
                <div className="p-2.5 bg-black rounded-xl border border-[#222]">
                  <span className="text-[9px] text-gray-500 block">بدهکاران</span>
                  <span className="text-xs font-bold text-rose-500 mt-1 block">
                    {toPersianDigits(debtors.length)} نفر
                  </span>
                </div>
                <div className="p-2.5 bg-black rounded-xl border border-[#222]">
                  <span className="text-[9px] text-gray-500 block">جمع کل بدهی</span>
                  <span className="text-xs font-bold text-amber-500 mt-1 block leading-none pt-1">
                    {formatToman(totalRemainingDebt)}
                    <span className="text-[8px] font-normal text-gray-400 block mt-0.5">تومان</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Bale API Configuration */}
          <div className="bg-[#0d0d0d] p-5 rounded-3xl border border-[#222] space-y-4">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-500" />
              پیکربندی بازوی پیام‌رسان بله
            </span>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">
                  توکن ربات بله (Bale Bot Token):
                </label>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    placeholder="مثال: 123456789:ABCdefGhI..."
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-black border border-[#222] rounded-xl text-[11px] text-white placeholder-gray-700 focus:outline-none focus:border-amber-500 font-sans"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">
                  شناسه چت یا گروه بله (Chat ID / Group ID):
                </label>
                <input
                  type="text"
                  placeholder="مثال: -100123456789 یا 987654321"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black border border-[#222] rounded-xl text-[11px] text-white placeholder-gray-700 focus:outline-none focus:border-amber-500 font-sans"
                  dir="ltr"
                />
              </div>

              <div className="p-3 bg-[#111] rounded-2xl border border-[#222] flex items-start gap-2 text-[10px] text-gray-400 leading-relaxed">
                <HelpCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-bold block mb-0.5">چگونه چت‌آیدی را بدست آوریم؟</span>
                  ربات خود را در بله ساخته و آن را به گروه درسی مورد نظر اضافه و ادمین کنید. سپس با ارسال یک پیام تست به گروه، آیدی عددی گروه را از طریق وب‌هوک یا ربات‌های آیدی‌یاب استخراج کنید (شناسه گروه‌ها در بله معمولاً با یک عدد منفی یا بدون آن شروع می‌شود).
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Generated Report Preview & Interactive Sender */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-[#0d0d0d] p-6 rounded-3xl border border-[#222] flex flex-col justify-between min-h-[450px]">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-[#222] pb-3">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  پیش‌نمایش گزارش متنی آماده شده
                </span>
                
                <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20 font-bold">
                  فرمت مونو بله
                </span>
              </div>

              {statusMsg.text && (
                <div
                  className={`p-3.5 rounded-2xl text-xs border font-sans leading-relaxed ${
                    statusMsg.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                  }`}
                >
                  {statusMsg.text}
                </div>
              )}

              {/* Text Area Code block representation */}
              <div className="bg-black/80 border border-[#222] rounded-2xl p-5 font-mono text-xs text-amber-500/90 whitespace-pre-wrap overflow-y-auto max-h-[360px] leading-relaxed select-text" dir="rtl">
                {selectedCourse ? generateReportText() : (
                  <div className="text-center text-gray-600 py-12 font-sans">
                    لطفاً جهت تولید خودکار پیش‌نویس گزارش، یک دوره آموزشی را از پنل سمت راست انتخاب نمایید.
                  </div>
                )}
              </div>
            </div>

            {selectedCourse && (
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#222] mt-6">
                <button
                  onClick={handleSendToBale}
                  disabled={isSending}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-800 text-black font-bold text-xs rounded-2xl cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_25px_rgba(245,158,11,0.25)]"
                >
                  {isSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      در حال مخابره به بله...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      ارسال مستقیم به گروه پیام‌رسان بله
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopy}
                  className="px-6 py-3 bg-[#111] hover:bg-[#1a1a1a] border border-[#222] text-white font-bold text-xs rounded-2xl cursor-pointer transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      کپی شد!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      کپی متن گزارش جهت ارسال دستی
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
