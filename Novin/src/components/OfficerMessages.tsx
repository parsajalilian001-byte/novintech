/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Send,
  User,
  MessageSquare,
  CheckCircle2,
  Clock,
  Trash2,
  Mail,
  Inbox,
  AlertCircle
} from 'lucide-react';
import { User as UserType, OfficerMessage, UserRole } from '../types';

interface OfficerMessagesProps {
  currentUser: UserType;
  users: UserType[];
  messages: OfficerMessage[];
  onSendMessage: (receiverId: string, text: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onMarkAsRead: (messageId: string) => void;
}

export default function OfficerMessages({
  currentUser,
  users,
  messages,
  onSendMessage,
  onDeleteMessage,
  onMarkAsRead
}: OfficerMessagesProps) {
  const [messageText, setMessageText] = useState('');
  const [selectedReceiverId, setSelectedReceiverId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isEmployee = currentUser.role === 'employee';

  // Managers are either 'admin' (مدیر ارشد) or 'finance' (مدیر مالی)
  const managers = users.filter((u) => u.role === 'admin' || u.role === 'finance');

  // Filter messages based on role
  // If employee: show messages sent by this employee
  // If manager: show messages sent to this manager
  const displayedMessages = isEmployee
    ? messages.filter((m) => m.senderId === currentUser.id)
    : messages.filter((m) => m.receiverId === currentUser.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedReceiverId) {
      setErrorMsg('لطفاً مدیر دریافت‌کننده پیام را انتخاب نمایید.');
      return;
    }

    if (!messageText.trim()) {
      setErrorMsg('لطفاً متن پیام خود را بنویسید.');
      return;
    }

    onSendMessage(selectedReceiverId, messageText.trim());
    setMessageText('');
    setSuccessMsg('✅ پیام شما با موفقیت به کارتابل مدیر مربوطه ارسال شد.');
    
    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  const getRoleLabel = (role: UserRole) => {
    if (role === 'admin') return 'مدیر ارشد';
    if (role === 'finance') return 'مدیر مالی';
    return 'کارشناس ثبت‌نام';
  };

  return (
    <div className="space-y-6 select-none" dir="rtl">
      {/* Introduction Card */}
      <div className="bg-[#0d0d0d] p-6 rounded-3xl border border-[#222] space-y-2">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-amber-500" />
          {isEmployee ? 'ارتباط مستقیم با مدیریت و امور مالی' : 'پیام‌های دریافتی از کارشناسان ثبت‌نام'}
        </h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          {isEmployee
            ? 'در این بخش می‌توانید به عنوان کارشناس ثبت‌نام، گزارش‌های ضروری، مغایرت‌های مالی یا درخواست‌های خود را بنویسید و به صورت مستقیم برای مدیر ارشد یا مدیر مالی مربوطه ارسال نمایید.'
            : 'لیست گزارش‌ها و هماهنگی‌های ارسالی توسط کارشناسان ثبت‌نام در این کارتابل نمایش داده می‌شود. می‌توانید پیام‌ها را بررسی کرده و وضعیت خوانده شده برای آن‌ها ثبت کنید.'}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Side: Message Composer (Only visible/applicable to employee) */}
        {isEmployee && (
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-[#0d0d0d] p-5 rounded-3xl border border-[#222] space-y-4">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500" />
                ارسال پیام جدید
              </span>

              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs rounded-2xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-2xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <div>
                  <label className="text-[10px] text-gray-400 block mb-1.5">مدیر دریافت‌کننده:</label>
                  <select
                    value={selectedReceiverId}
                    onChange={(e) => setSelectedReceiverId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black border border-[#222] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="">انتخاب مدیر ارشد یا مدیر مالی...</option>
                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({getRoleLabel(m.role)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 block mb-1.5">متن پیام / گزارش:</label>
                  <textarea
                    rows={6}
                    placeholder="متن هماهنگی، تایید واریزی یا مشکل پرونده دانشجو را در این قسمت یادداشت نمایید..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-[#222] rounded-2xl text-xs text-white placeholder-gray-700 focus:outline-none focus:border-amber-500 leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-2xl cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_25px_rgba(245,158,11,0.25)]"
                >
                  <Send className="w-4 h-4" />
                  ارسال مستقیم به کارتابل مدیریت
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Right Side: Message History / Inbox */}
        <div className={isEmployee ? 'xl:col-span-2 space-y-6' : 'xl:col-span-3 space-y-6'}>
          <div className="bg-[#0d0d0d] p-6 rounded-3xl border border-[#222] flex flex-col justify-between min-h-[400px]">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-[#222] pb-3">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-amber-500" />
                  {isEmployee ? 'پیام‌های ارسال شده شما' : 'لیست پیام‌های ارسالی کارشناسان'}
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20 font-bold">
                  تعداد: {displayedMessages.length}
                </span>
              </div>

              {displayedMessages.length === 0 ? (
                <div className="text-center text-gray-600 py-16 font-sans flex flex-col items-center justify-center gap-3">
                  <Mail className="w-12 h-12 text-gray-800" />
                  <span className="text-xs">پیامی در این کارتابل یافت نشد.</span>
                </div>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {displayedMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-2xl border transition-all duration-200 ${
                        msg.isRead
                          ? 'bg-black/40 border-[#222] opacity-75'
                          : 'bg-[#121212] border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.02)]'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-2 flex-1">
                          {/* Header of message */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-white flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-gray-400" />
                              {isEmployee ? `به: ${msg.receiverName}` : `از طرف: ${msg.senderName}`}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 bg-[#222] text-gray-400 rounded-md font-medium">
                              {isEmployee ? getRoleLabel(msg.receiverRole as UserRole) : getRoleLabel(msg.senderRole as UserRole)}
                            </span>
                            <span className="text-[10px] text-gray-500 flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-gray-600" />
                              {msg.timestamp}
                            </span>
                          </div>

                          {/* Message Body */}
                          <p className="text-xs text-[#e0e0e0] leading-relaxed whitespace-pre-wrap font-sans pt-1">
                            {msg.text}
                          </p>
                        </div>

                        {/* Status / Actions */}
                        <div className="flex items-center gap-2 self-start flex-shrink-0">
                          {isEmployee ? (
                            <span
                              className={`text-[9px] px-2 py-1 rounded-full border font-bold flex items-center gap-1 ${
                                msg.isRead
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                  : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                              }`}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              {msg.isRead ? 'خوانده شده' : 'ارسال شده'}
                            </span>
                          ) : (
                            <>
                              {!msg.isRead && (
                                <button
                                  onClick={() => onMarkAsRead(msg.id)}
                                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-[9px] rounded-lg cursor-pointer transition-colors"
                                >
                                  تایید خواندن
                                </button>
                              )}
                              <button
                                onClick={() => onDeleteMessage(msg.id)}
                                className="p-1.5 bg-[#222] hover:bg-rose-500/10 border border-[#333] hover:border-rose-500/20 text-gray-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                                title="حذف پیام"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
