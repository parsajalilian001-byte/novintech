/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Shield,
  Key,
  Lock,
  Unlock,
  RefreshCw,
  Cpu,
  Fingerprint,
  Zap,
  Server,
  Terminal,
  Activity,
  AlertTriangle,
  Database,
  CheckCircle2,
  UserPlus,
  Users,
  Trash2,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { SecurityConfig, UserRole, User } from '../types';
import { toPersianDigits } from '../utils';

interface SecurityPanelProps {
  security: SecurityConfig;
  onRotateKey: () => void;
  onToggleSystemLock: () => void;
  currentUserRole: UserRole;
  users: User[];
  onAddUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  onDeleteUser: (id: string) => void;
  currentUserId?: string;
}

export default function SecurityPanel({
  security,
  onRotateKey,
  onToggleSystemLock,
  currentUserRole,
  users,
  onAddUser,
  onDeleteUser,
  currentUserId,
}: SecurityPanelProps) {
  const [isRotating, setIsRotating] = useState(false);

  // User Management Form states
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('employee');
  const [formError, setFormError] = useState('');

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newUserName.trim() || !newUserUsername.trim() || !newUserPassword.trim()) {
      setFormError('لطفاً تمامی فیلدها را با دقت پر کنید.');
      return;
    }

    if (newUserUsername.trim().length < 3) {
      setFormError('نام کاربری باید حداقل ۳ کاراکتر باشد.');
      return;
    }

    if (newUserPassword.length < 4) {
      setFormError('کلمه عبور باید حداقل ۴ کاراکتر باشد.');
      return;
    }

    // Check if username is already taken
    const isTaken = users.some(u => u.username.toLowerCase() === newUserUsername.trim().toLowerCase());
    if (isTaken) {
      setFormError('این نام کاربری قبلاً ثبت شده است.');
      return;
    }

    onAddUser({
      name: newUserName.trim(),
      username: newUserUsername.trim().toLowerCase(),
      password: newUserPassword,
      role: newUserRole,
    });

    // Reset fields
    setNewUserName('');
    setNewUserUsername('');
    setNewUserPassword('');
    setNewUserRole('employee');
  };

  const handleRotate = () => {
    setIsRotating(true);
    setTimeout(() => {
      onRotateKey();
      setIsRotating(false);
    }, 1200);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Panel */}
      <div className="bg-[#0d0d0d] p-6 rounded-3xl border border-[#222]">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            داشبورد امنیت سایبری و رمزنگاری پیشرفته داده‌ها
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            رمزنگاری نامتقارن کلیدهای مالی، مکانیزم‌های پیشگیری از دستکاری و مدیریت وضعیت حفاظت از حریم خصوصی دانشجویان
          </p>
        </div>
      </div>

      {/* Grid: Indicators and Interactive Security Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security Parameters indicators */}
        <div className="bg-[#0d0d0d] border border-[#222] p-6 rounded-3xl space-y-5">
          <h4 className="text-xs font-bold text-amber-500 flex items-center gap-2 border-b border-[#222] pb-3">
            <Fingerprint className="w-4 h-4" />
            شاخص‌های پایداری و رمزگذاری فعال
          </h4>

          {/* Stat 1 */}
          <div className="space-y-1">
            <span className="text-gray-500 text-[10px] block">الگوریتم محافظتی فعال:</span>
            <span className="font-bold text-white text-xs font-mono">{security.algorithm}</span>
          </div>

          {/* Stat 2 */}
          <div className="space-y-1">
            <span className="text-gray-500 text-[10px] block">آخرین چرخش خودکار کلیدهای امنیتی:</span>
            <span className="font-bold text-gray-300 text-xs font-mono">{toPersianDigits(security.lastRotation)}</span>
          </div>

          {/* Stat 3 */}
          <div className="space-y-1">
            <span className="text-gray-500 text-[10px] block">وضعیت گواهی SSL و فایروال:</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              تأیید و ایمن (گواهینامه کوانتومی فعال)
            </span>
          </div>

          {/* Hash visualizer */}
          <div className="space-y-1.5 pt-2">
            <span className="text-gray-500 text-[10px] block">کلید هگزادسیمال رمزنگاری دیسک (SHA-512):</span>
            <div className="bg-black/50 p-3 rounded-2xl border border-[#222] font-mono text-[9px] text-amber-500/80 break-all select-all leading-normal">
              {security.encryptionKey}
            </div>
          </div>
        </div>

        {/* Security Actions Dashboard */}
        <div className="lg:col-span-2 bg-[#0d0d0d] border border-[#222] p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-white mb-4 flex items-center gap-2 border-b border-[#222] pb-3">
              <Cpu className="w-4 h-4 text-amber-500" />
              عملیات و مدیریت کلیدهای فوق‌امنیتی
            </h4>

            {/* Warning if role is not admin */}
            {currentUserRole !== 'admin' && (
              <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs rounded-2xl flex items-start gap-2 leading-relaxed">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>هشدار سطح دسترسی:</strong> شما با نقش فعلی خود اجازه اعمال چرخش کلید رمزنگاری یا فعالسازی قفل اضطراری کل سامانه را ندارید. جهت دسترسی کامل لطفا از منوی بالای صفحه نقش خود را به <strong>مدیر ارشد (Super Admin)</strong> ارتقا دهید.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Rotation card */}
              <div className="bg-[#111] border border-[#222] p-5 rounded-2xl text-right space-y-3">
                <div className="flex items-center gap-2 text-amber-500">
                  <RefreshCw className="w-4 h-4" />
                  <span className="font-bold text-xs">چرخش دستی کلیدهای مالی</span>
                </div>
                <p className="text-[10px] text-gray-500 leading-normal">
                  جهت غیرقابل نفوذ ماندن همیشگی دیتابیس، کلید هگزادسیمال SHA-512 را تغییر داده و تراکنش‌های پیشین را با کلید جدید هماهنگ می‌کند.
                </p>
                <button
                  onClick={handleRotate}
                  disabled={currentUserRole !== 'admin' || isRotating}
                  className="w-full text-center py-2.5 bg-amber-500/10 hover:bg-amber-500/20 disabled:bg-[#111] disabled:text-gray-700 disabled:border-transparent border border-amber-500/30 text-amber-500 font-bold text-xs rounded-full transition-all duration-200 cursor-pointer"
                >
                  {isRotating ? 'در حال محاسبات رمزنگاری...' : 'اجرای چرخش کلید رمز'}
                </button>
              </div>

              {/* Emergency system lock */}
              <div className="bg-[#111] border border-[#222] p-5 rounded-2xl text-right space-y-3">
                <div className="flex items-center gap-2 text-rose-500">
                  <Lock className="w-4 h-4" />
                  <span className="font-bold text-xs">قفل اضطراری و موقت کلیه حساب‌ها</span>
                </div>
                <p className="text-[10px] text-gray-500 leading-normal">
                  در صورت هرگونه حمله فیشینگ یا دسترسی غیرمجاز، فوراً دیتابیس را قفل موقت کنید. ثبت‌نام‌ها و تراکنش‌های جدید تا رفع قفل متوقف می‌گردند.
                </p>
                <button
                  onClick={onToggleSystemLock}
                  disabled={currentUserRole !== 'admin'}
                  className={`w-full text-center py-2.5 font-bold text-xs rounded-full transition-all duration-200 cursor-pointer ${
                    security.isSystemLocked
                      ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-500'
                      : 'bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500'
                  }`}
                >
                  {security.isSystemLocked ? 'آزاد سازی قفل پایگاه‌داده' : 'فعالسازی قفل اضطراری دیتابیس'}
                </button>
              </div>
            </div>
          </div>

          {/* Secure pipeline visual chart */}
          <div className="mt-6 pt-4 border-t border-[#222]">
            <span className="text-[10px] text-gray-500 block mb-3 font-semibold text-center">
              مسیر امن انتقال داده‌ها در درگاه مالی آموزشگاه نوین تک
            </span>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 text-xs text-gray-400 font-sans">
              <div className="bg-black/50 border border-[#222] px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-amber-500" />
                پایگاه‌داده ابری
              </div>
              <div className="hidden sm:block text-amber-500">←</div>
              <div className="bg-black/50 border border-amber-500/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-amber-500">
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                کلاینت (رمزنگاری AES)
              </div>
              <div className="hidden sm:block text-amber-500">←</div>
              <div className="bg-black/50 border border-[#222] px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-500" />
                کانال TLS 1.3
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee User Management Panel */}
      <div className="bg-[#0d0d0d] p-6 rounded-3xl border border-[#222] space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#222] pb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              مدیریت دسترسی کارمندان و نقش‌های کاربری
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              تعریف کارمندان جدید، تخصیص سطح دسترسی مناسب و کنترل حساب‌های فعال سامانه
            </p>
          </div>
        </div>

        {currentUserRole !== 'admin' ? (
          <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center gap-3 text-amber-500 text-xs">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>تنها مدیر ارشد سامانه (Super Admin) مجوز ایجاد، مشاهده و ویرایش کاربران یا دسترسی‌ها را دارد.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Create user form */}
            <div className="xl:col-span-1 bg-[#111] border border-[#222] p-5 rounded-2xl space-y-4">
              <span className="text-xs font-bold text-white flex items-center gap-2 mb-2">
                <UserPlus className="w-4 h-4 text-amber-500" />
                تعریف حساب کاربری جدید
              </span>
              
              <form onSubmit={handleCreateUserSubmit} className="space-y-3">
                {formError && (
                  <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs rounded-xl font-sans text-center">
                    {formError}
                  </div>
                )}
                
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">نام و نام خانوادگی:</label>
                  <input
                    type="text"
                    placeholder="مثال: علی حسینی"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-[#222] rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">نام کاربری (انگلیسی):</label>
                  <input
                    type="text"
                    placeholder="مثال: ali_h"
                    value={newUserUsername}
                    onChange={(e) => setNewUserUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-[#222] rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 font-sans"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">کلمه عبور (رمز عبور):</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-[#222] rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 font-sans"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">نقش و سطح دسترسی:</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-black border border-[#222] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="employee">کارشناس ثبت‌نام (Officer)</option>
                    <option value="finance">مدیر مالی (Finance Manager)</option>
                    <option value="admin">مدیر ارشد (Super Admin)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full text-center py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl cursor-pointer transition-all duration-200 mt-2 flex items-center justify-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  ایجاد حساب کاربری
                </button>
              </form>
            </div>

            {/* Users list */}
            <div className="xl:col-span-2 bg-[#111] border border-[#222] p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-2 mb-4">
                  <UserCheck className="w-4 h-4 text-amber-500" />
                  لیست حساب‌های کاربری فعال
                </span>

                <div className="overflow-y-auto max-h-[300px] divide-y divide-[#222]/50 pr-1 text-xs">
                  {users.map((user) => {
                    const isSelf = user.id === currentUserId || user.username === 'parsa';
                    let roleBadge = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
                    let roleLabel = 'کارشناس ثبت‌نام';
                    if (user.role === 'admin') {
                      roleBadge = 'bg-rose-500/10 text-rose-500 border-rose-500/20';
                      roleLabel = 'مدیر ارشد';
                    } else if (user.role === 'finance') {
                      roleBadge = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
                      roleLabel = 'مدیر مالی';
                    }

                    return (
                      <div key={user.id} className="py-3.5 flex justify-between items-center hover:bg-white/5 rounded-xl px-3 transition-all">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{user.name}</span>
                            <span className={`px-2 py-0.5 border text-[9px] font-bold rounded-full ${roleBadge}`}>
                              {roleLabel}
                            </span>
                            {isSelf && (
                              <span className="px-1.5 py-0.5 bg-white/10 text-gray-300 text-[9px] rounded-full">
                                حساب اصلی یا فعال شما
                              </span>
                            )}
                          </div>
                          <p className="text-gray-500 text-[10px] font-sans">
                            نام کاربری: <span className="text-gray-300">{user.username}</span> | کلمه عبور: <span className="text-gray-400 font-mono">{user.password}</span>
                          </p>
                        </div>

                        {!isSelf && (
                          <button
                            onClick={() => onDeleteUser(user.id)}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-full transition-all cursor-pointer border border-rose-500/20"
                            title="حذف حساب کاربری"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
