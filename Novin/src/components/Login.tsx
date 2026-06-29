/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, User, LogIn, AlertCircle } from 'lucide-react';
import { User as UserType } from '../types';

interface LoginProps {
  onLogin: (username: string, password: string) => boolean;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('لطفاً نام کاربری و کلمه عبور خود را وارد کنید.');
      return;
    }

    setIsLoading(true);

    // Simulate database check transition for realism
    setTimeout(() => {
      const success = onLogin(username.trim().toLowerCase(), password);
      setIsLoading(false);
      if (!success) {
        setError('نام کاربری یا کلمه عبور نادرست است.');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans select-none" dir="rtl">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)] mb-2">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">سامانه مدیریت اقساط نوین تک</h1>
          <p className="text-xs text-gray-500">پنل دسترسی یکپارچه و امن کارمندان و مدیریت ارشد</p>
        </div>

        {/* Form Container */}
        <div className="bg-[#0d0d0d] border border-[#222] p-8 rounded-3xl shadow-2xl relative">
          <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold rounded-full border border-emerald-500/20">
            درگاه امن SSL فعال
          </span>

          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs rounded-2xl flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 block font-medium">نام کاربری:</label>
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="نام کاربری خود را وارد کنید..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-4 pr-11 py-3 bg-black border border-[#222] rounded-2xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 transition-all font-sans"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 block font-medium">کلمه عبور (پسورد):</label>
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-4 pr-11 py-3 bg-black border border-[#222] rounded-2xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 transition-all font-sans"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-800 text-black font-bold text-sm rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] cursor-pointer transition-all duration-200 mt-2 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  ورود به پنل کاربری
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info card */}
        <div className="text-center mt-6">
          <p className="text-[10px] text-gray-600 font-sans">
            کپی‌رایت © ۱۴۰۵ آموزشگاه نوین تک. کلیه حقوق امنیتی این درگاه مالی محفوظ است.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
