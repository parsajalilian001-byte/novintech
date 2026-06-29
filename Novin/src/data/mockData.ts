/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, Installment, Transaction, SystemLog, ReminderLog, SecurityConfig } from '../types';

export const initialStudents: Student[] = [];

export const initialInstallments: Installment[] = [];

export const initialTransactions: Transaction[] = [];

export const initialLogs: SystemLog[] = [
  {
    id: 'log-initial',
    userId: 'usr-admin',
    userName: 'امیر نوین‌مهر',
    role: 'admin',
    action: 'راه‌اندازی سیستم',
    timestamp: '۱۴۰۵/۰۱/۰۱ ۰۸:۰۰:۰۰',
    details: 'پیکربندی اولیه سامانه مدیریت اقساط نوین تک و فعال‌سازی پروتکل‌های رمزنگاری دیسک با موفقیت انجام شد.',
    ipAddress: '127.0.0.1'
  }
];

export const initialReminders: ReminderLog[] = [];

export const initialSecurity: SecurityConfig = {
  encryptionKey: '0x8F9C4A2B7E1D3F0A5E6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F',
  lastRotation: '۱۴۰۵/۰۱/۰۱ ۰۸:۰۰:۰۰',
  status: 'فعال',
  algorithm: 'AES-256-GCM (کوانتومی)',
  isSystemLocked: false
};
