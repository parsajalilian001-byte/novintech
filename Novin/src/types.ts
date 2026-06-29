/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  id: string;
  name: string;
  studentCode: string;
  nationalId: string;
  phone: string;
  courseName: string;
  totalAmount: number;
  remainingAmount: number;
  createdAt: string;
}

export interface Installment {
  id: string;
  studentId: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: 'paid' | 'pending' | 'overdue';
  paidAmount: number;
  paymentDate?: string;
}

export interface Transaction {
  id: string;
  studentId: string;
  installmentId: string;
  amount: number;
  date: string; // YYYY-MM-DD HH:mm
  paymentMethod: 'نقدی' | 'کارت به کارت' | 'درگاه بانکی' | 'چک';
  referenceCode: string;
  recordedBy: string; // User Name / Role
}

export type UserRole = 'admin' | 'finance' | 'employee';

export interface SystemLog {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  timestamp: string; // YYYY-MM-DD HH:mm:ss
  details: string;
  ipAddress: string;
}

export interface ReminderLog {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  type: 'sms' | 'system';
  status: 'sent' | 'failed' | 'scheduled';
  scheduledTime: string;
  sentTime?: string;
  message: string;
}

export interface SecurityConfig {
  encryptionKey: string;
  lastRotation: string;
  status: 'فعال' | 'غیرفعال';
  algorithm: string;
  isSystemLocked: boolean;
}

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  createdAt: string;
}

export interface OfficerMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId: string;
  receiverName: string;
  receiverRole: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface FarazSmsConfig {
  enabled: boolean;
  apiKey: string;
  sender: string;
  patternCode: string;
  varName: string;
  varAmount: string;
  varDate: string;
  varCourse: string;
}

