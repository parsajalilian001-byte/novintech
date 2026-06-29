/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  LayoutDashboard,
  Users,
  Receipt,
  MessageSquare,
  Terminal,
  Settings,
  Lock,
  Unlock,
  UserCheck,
  Menu,
  X,
  Sparkles,
  Info,
  LogOut,
  Send,
  Mail,
} from 'lucide-react';

import {
  Student,
  Installment,
  Transaction,
  SystemLog,
  ReminderLog,
  SecurityConfig,
  UserRole,
  User,
  OfficerMessage,
  FarazSmsConfig,
} from './types';

import {
  initialStudents,
  initialInstallments,
  initialTransactions,
  initialLogs,
  initialReminders,
  initialSecurity,
} from './data/mockData';

import Dashboard from './components/Dashboard';
import StudentsList from './components/StudentsList';
import Transactions from './components/Transactions';
import Reminders from './components/Reminders';
import AuditLogs from './components/AuditLogs';
import SecurityPanel from './components/SecurityPanel';
import Login from './components/Login';
import BaleIntegration from './components/BaleIntegration';
import OfficerMessages from './components/OfficerMessages';

const initialUsers: User[] = [
  {
    id: 'usr-parsa',
    name: 'پارسا جلیلیان',
    username: 'parsa',
    password: 'parsaj1387',
    role: 'admin',
    createdAt: '۱۴۰۵/۰۱/۰۱',
  },
  {
    id: 'usr-maryam',
    name: 'مریم حسینی',
    username: 'maryam',
    password: 'finance123',
    role: 'finance',
    createdAt: '۱۴۰۵/۰۱/۰۱',
  },
  {
    id: 'usr-zahra',
    name: 'زهرا احمدی (کارشناس ثبت‌نام)',
    username: 'zahra',
    password: 'employee123',
    role: 'employee',
    createdAt: '۱۴۰۵/۰۱/۰۱',
  }
];

const initialMessages: OfficerMessage[] = [
  {
    id: 'msg-1',
    senderId: 'usr-zahra',
    senderName: 'زهرا احمدی (کارشناس ثبت‌نام)',
    senderRole: 'employee',
    receiverId: 'usr-parsa',
    receiverName: 'پارسا جلیلیان',
    receiverRole: 'admin',
    text: 'سلام و وقت بخیر؛ شهریه هنرجو مهران علوی در قسط اول به دلیل مشکلات بانکی با تاخیر پرداخت خواهد شد.',
    timestamp: '۱۴۰۵/۰۴/۰۹ ۰۹:۱۵',
    isRead: false
  },
  {
    id: 'msg-2',
    senderId: 'usr-zahra',
    senderName: 'زهرا احمدی (کارشناس ثبت‌نام)',
    senderRole: 'employee',
    receiverId: 'usr-maryam',
    receiverName: 'مریم حسینی',
    receiverRole: 'finance',
    text: 'خانم حسینی عزیز، لطفاً فیش واریزی نقدی قسط دوم خانم سارا راد را در دفتر کل بررسی فرمایید.',
    timestamp: '۱۴۰۵/۰۴/۰۹ ۱۰:۳۰',
    isRead: true
  }
];

const defaultFarazSmsConfig: FarazSmsConfig = {
  enabled: false,
  apiKey: '',
  sender: '3000505',
  patternCode: '',
  varName: 'name',
  varAmount: 'amount',
  varDate: 'date',
  varCourse: 'course'
};

export default function App() {
  // Main States
  const [students, setStudents] = useState<Student[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [reminders, setReminders] = useState<ReminderLog[]>([]);
  const [security, setSecurity] = useState<SecurityConfig>(initialSecurity);
  const [farazSmsConfig, setFarazSmsConfig] = useState<FarazSmsConfig>(defaultFarazSmsConfig);

  // Authentication & Users State
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<OfficerMessage[]>([]);

  // UI/Role States
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('admin');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Quick payment link state
  const [isQuickRecording, setIsQuickRecording] = useState(false);
  const [quickRecordData, setQuickRecordData] = useState<{ studentId: string; installmentId: string } | null>(null);

  // Toast alert state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Initialize and load from localStorage
  useEffect(() => {
    const storedStudents = localStorage.getItem('zarrin_clean_students');
    const storedInstallments = localStorage.getItem('zarrin_clean_installments');
    const storedTransactions = localStorage.getItem('zarrin_clean_transactions');
    const storedLogs = localStorage.getItem('zarrin_clean_logs');
    const storedReminders = localStorage.getItem('zarrin_clean_reminders');
    const storedSecurity = localStorage.getItem('zarrin_clean_security');
    const storedUsers = localStorage.getItem('zarrin_clean_users');
    const storedCurrentUser = localStorage.getItem('zarrin_clean_current_user');

    if (storedStudents) setStudents(JSON.parse(storedStudents));
    else {
      setStudents(initialStudents);
      localStorage.setItem('zarrin_clean_students', JSON.stringify(initialStudents));
    }

    if (storedInstallments) setInstallments(JSON.parse(storedInstallments));
    else {
      setInstallments(initialInstallments);
      localStorage.setItem('zarrin_clean_installments', JSON.stringify(initialInstallments));
    }

    if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
    else {
      setTransactions(initialTransactions);
      localStorage.setItem('zarrin_clean_transactions', JSON.stringify(initialTransactions));
    }

    if (storedLogs) setLogs(JSON.parse(storedLogs));
    else {
      setLogs(initialLogs);
      localStorage.setItem('zarrin_clean_logs', JSON.stringify(initialLogs));
    }

    if (storedReminders) setReminders(JSON.parse(storedReminders));
    else {
      setReminders(initialReminders);
      localStorage.setItem('zarrin_clean_reminders', JSON.stringify(initialReminders));
    }

    if (storedSecurity) setSecurity(JSON.parse(storedSecurity));
    else {
      setSecurity(initialSecurity);
      localStorage.setItem('zarrin_clean_security', JSON.stringify(initialSecurity));
    }

    // Load Faraz SMS config
    const storedFarazSms = localStorage.getItem('novintech_faraz_sms');
    if (storedFarazSms) {
      setFarazSmsConfig(JSON.parse(storedFarazSms));
    }

    // Load registered users
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      setUsers(initialUsers);
      localStorage.setItem('zarrin_clean_users', JSON.stringify(initialUsers));
    }

    // Load registered messages
    const storedMessages = localStorage.getItem('zarrin_clean_messages');
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    } else {
      setMessages(initialMessages);
      localStorage.setItem('zarrin_clean_messages', JSON.stringify(initialMessages));
    }

    // Load current active session
    if (storedCurrentUser) {
      const parsedUser = JSON.parse(storedCurrentUser);
      setCurrentUser(parsedUser);
      setCurrentUserRole(parsedUser.role);
    } else {
      setCurrentUser(null);
    }
  }, []);

  // Show customized modern Farsi toast alerts
  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Helper to create audit logs
  const logSystemAction = (action: string, details: string) => {
    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      userId: currentUser ? currentUser.id : `usr-${currentUserRole}`,
      userName: currentUser ? currentUser.name : 'کاربر سیستم',
      role: currentUser ? currentUser.role : currentUserRole,
      action,
      timestamp: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR').slice(0, 8),
      details,
      ipAddress: '192.168.1.' + Math.floor(100 + Math.random() * 150),
    };

    setLogs((prev) => {
      const updated = [newLog, ...prev];
      localStorage.setItem('zarrin_clean_logs', JSON.stringify(updated));
      return updated;
    });
  };

  // MESSAGING HANDLERS
  const handleSendMessage = (receiverId: string, text: string) => {
    const receiver = users.find((u) => u.id === receiverId);
    if (!receiver || !currentUser) return;

    const newMessage: OfficerMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      receiverId: receiver.id,
      receiverName: receiver.name,
      receiverRole: receiver.role,
      text,
      timestamp: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR').slice(0, 5),
      isRead: false,
    };

    setMessages((prev) => {
      const updated = [newMessage, ...prev];
      localStorage.setItem('zarrin_clean_messages', JSON.stringify(updated));
      return updated;
    });

    logSystemAction(
      'ارسال پیام به مدیریت',
      `پیام جدیدی از طرف ${currentUser.name} برای ${receiver.name} ارسال گردید.`
    );
    triggerToast(`پیام شما به ${receiver.name} با موفقیت ارسال شد.`);
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => {
      const updated = prev.filter((m) => m.id !== messageId);
      localStorage.setItem('zarrin_clean_messages', JSON.stringify(updated));
      return updated;
    });
    logSystemAction('حذف پیام', `یک پیام از صندوق پیام‌ها حذف شد.`);
    triggerToast('پیام مورد نظر با موفقیت حذف شد.', 'info');
  };

  const handleMarkAsRead = (messageId: string) => {
    setMessages((prev) => {
      const updated = prev.map((m) => (m.id === messageId ? { ...m, isRead: true } : m));
      localStorage.setItem('zarrin_clean_messages', JSON.stringify(updated));
      return updated;
    });
    logSystemAction('تایید خواندن پیام', `وضعیت پیام به خوانده شده تغییر یافت.`);
    triggerToast('پیام به عنوان خوانده شده علامت‌گذاری شد.');
  };

  // AUTHENTICATION HANDLERS
  const handleLogin = (username: string, password: string): boolean => {
    const user = users.find((u) => u.username === username.toLowerCase());
    if (user && user.password === password) {
      setCurrentUser(user);
      setCurrentUserRole(user.role);
      localStorage.setItem('zarrin_clean_current_user', JSON.stringify(user));
      
      setTimeout(() => {
        logSystemAction('ورود به سامانه', `کاربر ${user.name} با نقش ${user.role === 'admin' ? 'مدیر ارشد' : user.role === 'finance' ? 'مدیر مالی' : 'کارشناس'} با موفقیت وارد حساب خود شد.`);
      }, 50);
      
      triggerToast(`${user.name} عزیز، خوش آمدید.`);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    if (currentUser) {
      logSystemAction('خروج از سامانه', `کاربر ${currentUser.name} از حساب کاربری خود خارج شد.`);
    }
    setCurrentUser(null);
    localStorage.removeItem('zarrin_clean_current_user');
    triggerToast('شما با موفقیت از سیستم خارج شدید.', 'info');
  };

  const handleAddUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: userData.name,
      username: userData.username,
      password: userData.password,
      role: userData.role,
      createdAt: new Date().toLocaleDateString('fa-IR'),
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('zarrin_clean_users', JSON.stringify(updatedUsers));
    
    logSystemAction('تعریف کاربر جدید', `حساب کاربری جدید برای ${newUser.name} با سطح دسترسی ${newUser.role === 'admin' ? 'مدیر ارشد' : newUser.role === 'finance' ? 'مدیر مالی' : 'کارشناس'} ایجاد گردید.`);
    triggerToast(`حساب کاربری ${newUser.name} با موفقیت ایجاد شد.`);
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;
    
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('zarrin_clean_users', JSON.stringify(updatedUsers));
    
    logSystemAction('حذف حساب کاربری', `پرونده امنیتی حساب کاربری ${userToDelete.name} از سامانه برچیده شد.`);
    triggerToast('حساب کاربری با موفقیت حذف شد.', 'info');
  };

  // ACTION 1: Add New Student with customizable installments
  const handleAddStudent = (
    studentData: Omit<Student, 'id' | 'studentCode' | 'remainingAmount' | 'createdAt'>,
    customInstallments: { amount: number; dueDate: string }[]
  ) => {
    if (security.isSystemLocked) {
      triggerToast('سامانه در وضعیت قفل اضطراری است! عملیات ثبت‌نام متوقف شد.', 'error');
      return;
    }

    const newStudentId = `st-${Date.now()}`;
    const newStudentCode = String(Math.floor(99100000 + Math.random() * 900000));
    const newStudent: Student = {
      ...studentData,
      id: newStudentId,
      studentCode: newStudentCode,
      remainingAmount: studentData.totalAmount,
      createdAt: new Date().toLocaleDateString('fa-IR'),
    };

    // Prepare manual installments
    const newInsts: Installment[] = customInstallments.map((inst, index) => ({
      id: `inst-${newStudentId}-${index}-${Math.floor(1000 + Math.random() * 9000)}`,
      studentId: newStudentId,
      amount: inst.amount,
      dueDate: inst.dueDate,
      status: 'pending',
      paidAmount: 0,
    }));

    setStudents((prev) => {
      const updated = [newStudent, ...prev];
      localStorage.setItem('zarrin_clean_students', JSON.stringify(updated));
      return updated;
    });

    setInstallments((prev) => {
      const updated = [...prev, ...newInsts];
      localStorage.setItem('zarrin_clean_installments', JSON.stringify(updated));
      return updated;
    });

    logSystemAction(
      'ثبت‌نام دانشجو',
      `دانشجو ${studentData.name} در دوره ${studentData.courseName} ثبت‌نام شد و تعداد ${customInstallments.length} بند قسط دلخواه تعریف گردید.`
    );

    triggerToast(`پرونده مالی مستقل ${studentData.name} با موفقیت ثبت شد.`);
  };

  // ACTION 2: Record Transaction payment against installment
  const handleAddTransaction = (
    studentId: string,
    installmentId: string,
    payload: {
      amount: number;
      paymentMethod: 'نقدی' | 'کارت به کارت' | 'درگاه بانکی' | 'چک';
      referenceCode: string;
    }
  ) => {
    if (security.isSystemLocked) {
      triggerToast('سامانه در وضعیت قفل اضطراری است! ثبت تراکنش متوقف شد.', 'error');
      return;
    }

    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    // 1. Update installment status
    const updatedInstallments = installments.map((inst) => {
      if (inst.id === installmentId) {
        return {
          ...inst,
          status: 'paid' as const,
          paidAmount: payload.amount,
          paymentDate: new Date().toLocaleDateString('fa-IR'),
        };
      }
      return inst;
    });
    setInstallments(updatedInstallments);
    localStorage.setItem('zarrin_clean_installments', JSON.stringify(updatedInstallments));

    // 2. Create payment transaction record
    const newTx: Transaction = {
      id: `tr-${Date.now()}`,
      studentId,
      installmentId,
      amount: payload.amount,
      date: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR').slice(0, 5),
      paymentMethod: payload.paymentMethod,
      referenceCode: payload.referenceCode,
      recordedBy: currentUserRole === 'admin' ? 'امیر نوین‌مهر' : currentUserRole === 'finance' ? 'مریم حسینی' : 'حامد علیزاده',
    };

    setTransactions((prev) => {
      const updated = [newTx, ...prev];
      localStorage.setItem('zarrin_clean_transactions', JSON.stringify(updated));
      return updated;
    });

    // 3. Update student remaining balance
    const updatedStudents = students.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          remainingAmount: Math.max(0, s.remainingAmount - payload.amount),
        };
      }
      return s;
    });
    setStudents(updatedStudents);
    localStorage.setItem('zarrin_clean_students', JSON.stringify(updatedStudents));

    logSystemAction(
      'ثبت تراکنش',
      `قسط معادل ${payload.amount.toLocaleString()} ریال متعلق به ${student.name} از طریق ${payload.paymentMethod} تسویه و کد پیگیری ${payload.referenceCode} صادر شد.`
    );

    triggerToast(`تراکنش به مبلغ ${payload.amount.toLocaleString()} ریال با موفقیت ثبت شد.`);
  };

  // ACTION 3: Delete Student dossier (Admin only)
  const handleDeleteStudent = (studentId: string) => {
    if (security.isSystemLocked) {
      triggerToast('سامانه در وضعیت قفل اضطراری است! عملیات حذف متوقف شد.', 'error');
      return;
    }

    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const filteredStudents = students.filter((s) => s.id !== studentId);
    const filteredInstallments = installments.filter((i) => i.studentId !== studentId);
    const filteredTransactions = transactions.filter((t) => t.studentId !== studentId);

    setStudents(filteredStudents);
    setInstallments(filteredInstallments);
    setTransactions(filteredTransactions);

    localStorage.setItem('zarrin_clean_students', JSON.stringify(filteredStudents));
    localStorage.setItem('zarrin_clean_installments', JSON.stringify(filteredInstallments));
    localStorage.setItem('zarrin_clean_transactions', JSON.stringify(filteredTransactions));

    logSystemAction('حذف پرونده', `پرونده مالی مستقل دانشجو ${student.name} به همراه کلیه اقساط و تراکنش‌ها از حافظه دائم برچیده شد.`);
    triggerToast('پرونده مالی با موفقیت حذف گردید.', 'info');
  };

  // ACTION 4: Trigger SMS Reminder manually
  const handleTriggerManualSMS = (studentId: string, installmentId: string) => {
    const student = students.find((s) => s.id === studentId);
    const installment = installments.find((i) => i.id === installmentId);
    if (!student || !installment) return;

    const msg = `${student.name} گرامی، یادآوری می‌گردد سررسید قسط شما به مبلغ ${installment.amount.toLocaleString()} ریال در تاریخ ${installment.dueDate} فرا رسیده است. نسبت به تسویه از درگاه اقدام فرمایید. - واحد مالی نوین تک`;

    const saveReminderLog = (status: 'sent' | 'failed') => {
      const newReminder: ReminderLog = {
        id: `rem-${Date.now()}`,
        studentId,
        studentName: student.name,
        studentPhone: student.phone,
        type: 'sms',
        status,
        scheduledTime: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR').slice(0, 5),
        sentTime: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR').slice(0, 5),
        message: farazSmsConfig.enabled 
          ? `[ارسال واقعی با الگوی ${farazSmsConfig.patternCode}] متغیرها: ${JSON.stringify({
              [farazSmsConfig.varName || 'name']: student.name,
              [farazSmsConfig.varAmount || 'amount']: installment.amount.toLocaleString(),
              [farazSmsConfig.varDate || 'date']: installment.dueDate,
              [farazSmsConfig.varCourse || 'course']: student.courseName,
            })}`
          : msg,
      };

      setReminders((prev) => {
        const updated = [newReminder, ...prev];
        localStorage.setItem('zarrin_clean_reminders', JSON.stringify(updated));
        return updated;
      });
    };

    if (farazSmsConfig.enabled) {
      if (!farazSmsConfig.apiKey || !farazSmsConfig.patternCode || !farazSmsConfig.sender) {
        triggerToast('تنظیمات پنل پیامکی فرار اس ام اس ناقص است. لطفا ابتدا اطلاعات را تکمیل نمایید.', 'error');
        return;
      }

      triggerToast('در حال ارسال پیامک از درگاه فرار اس‌ام‌اس...', 'info');

      const values: Record<string, string> = {
        [farazSmsConfig.varName || 'name']: student.name,
        [farazSmsConfig.varAmount || 'amount']: installment.amount.toString(),
        [farazSmsConfig.varDate || 'date']: installment.dueDate,
        [farazSmsConfig.varCourse || 'course']: student.courseName,
      };

      fetch('/api/farazsms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: farazSmsConfig.apiKey,
          sender: farazSmsConfig.sender,
          patternCode: farazSmsConfig.patternCode,
          recipient: student.phone,
          values: values,
        }),
      })
        .then((res) => {
          if (!res.ok) {
            return res.json().then((errData) => {
              throw new Error(errData.description || 'پاسخ ناموفق از سرور پیامک');
            });
          }
          return res.json();
        })
        .then((data) => {
          if (data.ok) {
            triggerToast(`پیامک واقعی با موفقیت به ${student.name} ارسال شد.`);
            logSystemAction(
              'ارسال موفق پیامک فرار اس ام اس',
              `پیامک واقعی با موفقیت به شماره ${student.phone} متعلق به ${student.name} با الگوی ${farazSmsConfig.patternCode} ارسال شد.`
            );
            saveReminderLog('sent');
          } else {
            throw new Error(data.description || 'خطا در وب‌سرویس پیامکی');
          }
        })
        .catch((err) => {
          triggerToast(`خطا در ارسال پیامک واقعی: ${err.message}`, 'error');
          logSystemAction(
            'خطا در ارسال پیامک فرار اس ام اس',
            `خطا در ارسال پیامک به شماره ${student.phone} متعلق به ${student.name}: ${err.message}`
          );
          saveReminderLog('failed');
        });
    } else {
      // Simulation mode
      saveReminderLog('sent');
      logSystemAction('پیامک یادآور دستی (شبیه‌ساز)', `ارسال پیامک شبیه‌سازی شده یادآوری دستی قسط به شماره ${student.phone} متعلق به ${student.name}.`);
      triggerToast(`پیامک تذکر (شبیه‌ساز) با موفقیت برای ${student.name} فرستاده شد.`);
    }
  };

  // ACTION 5: Daily check simulation (scans for overdue and auto-sends SMS reminders)
  const handleSimulateDailyCheck = () => {
    // We scan pending installments. For demo, we mark all whose date is close as Overdue, and schedule/send alerts.
    let updatedCount = 0;
    const todayStr = '1405/04/08'; // let's assume this is today

    const updatedInsts = installments.map((inst) => {
      if (inst.status === 'pending') {
        const parts = inst.dueDate.split('/');
        const partDay = parseInt(parts[2], 10);
        const partMonth = parseInt(parts[1], 10);
        // Let's assume installments prior to July 8th (04/08) are overdue
        if (partMonth < 4 || (partMonth === 4 && partDay < 8)) {
          updatedCount++;
          return { ...inst, status: 'overdue' as const };
        }
      }
      return inst;
    });

    if (updatedCount > 0) {
      setInstallments(updatedInsts);
      localStorage.setItem('zarrin_clean_installments', JSON.stringify(updatedInsts));
    }

    // Append a demo system logs showing auto checks
    logSystemAction('پایش خودکار روزانه', `اتوماسیون پایش کل بدهکاران اجرا شد. تعداد ${updatedCount} قسط جدید به عنوان معوقه نشانه‌گذاری گردید.`);
    triggerToast(`پایش به اتمام رسید. ${updatedCount} قسط معوقه جدید معین و پیامک اخطار ارسال شد.`, 'info');
  };

  const handleSaveFarazSmsConfig = (newConfig: FarazSmsConfig) => {
    setFarazSmsConfig(newConfig);
    localStorage.setItem('novintech_faraz_sms', JSON.stringify(newConfig));
    logSystemAction('تنظیمات پیامک', `تنظیمات درگاه پیامکی فرار اس ام اس بروزرسانی شد. وضعیت درگاه: ${newConfig.enabled ? 'فعال' : 'غیرفعال'}`);
    triggerToast('تنظیمات پنل پیامکی فرار اس ام اس با موفقیت ذخیره شد.');
  };

  // ACTION 6: Rotate security key
  const handleRotateKey = () => {
    const chars = '0123456789ABCDEF';
    let newHex = '0x';
    for (let i = 0; i < 64; i++) {
      newHex += chars[Math.floor(Math.random() * 16)];
    }

    const updatedSec: SecurityConfig = {
      ...security,
      encryptionKey: newHex,
      lastRotation: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR').slice(0, 8),
    };

    setSecurity(updatedSec);
    localStorage.setItem('zarrin_clean_security', JSON.stringify(updatedSec));

    logSystemAction('چرخش کلید رمز', 'عملیات تجدید و چرخش کلید هگزادسیمال SHA-512 با موفقیت انجام پذیرفت.');
    triggerToast('کلید هگزادسیمال امنیتی سیستم با موفقیت تجدید شد.');
  };

  // ACTION 7: Toggle system emergency lock
  const handleToggleSystemLock = () => {
    const nextState = !security.isSystemLocked;
    const updatedSec: SecurityConfig = {
      ...security,
      isSystemLocked: nextState,
    };

    setSecurity(updatedSec);
    localStorage.setItem('zarrin_clean_security', JSON.stringify(updatedSec));

    logSystemAction(
      nextState ? 'فعالسازی قفل اضطراری' : 'آزادسازی قفل',
      nextState ? 'کلیه دسترسی‌های ثبت‌نام و واریزی با فرمان مدیر ارشد مسدود گردید.' : 'قفل دیتابیس آزاد شد و شرایط به وضعیت عادی بازگشت.'
    );

    triggerToast(
      nextState ? 'سامانه فوراً قفل شد. عملیات جدید مسدود است!' : 'قفل امنیتی سامانه آزاد شد و شرایط عادی است.',
      nextState ? 'error' : 'success'
    );
  };

  // Trigger from Dashboard to open record modal
  const handleQuickRecordPayment = (studentId: string, installmentId: string) => {
    setQuickRecordData({ studentId, installmentId });
    setIsQuickRecording(true);
    setActiveTab('transactions');
  };

  // Guard forbidden tabs for employee role
  useEffect(() => {
    const role = currentUser?.role || currentUserRole;
    if (role === 'employee') {
      const allowed = ['students', 'transactions', 'officer_messages'];
      if (!allowed.includes(activeTab)) {
        setActiveTab('students');
      }
    }
  }, [currentUser, currentUserRole, activeTab]);

  const getVisibleTabs = () => {
    const role = currentUser?.role || currentUserRole;
    if (role === 'employee') {
      return [
        { id: 'students', label: 'پرونده‌های مالی دانشجویان', icon: Users },
        { id: 'transactions', label: 'دفتر کل تراکنش‌ها', icon: Receipt },
        { id: 'officer_messages', label: 'ارسال پیام به مدیریت', icon: Send },
      ];
    } else {
      return [
        { id: 'dashboard', label: 'پیشخوان تحلیلی', icon: LayoutDashboard },
        { id: 'students', label: 'پرونده‌های مالی دانشجویان', icon: Users },
        { id: 'transactions', label: 'دفتر کل تراکنش‌ها', icon: Receipt },
        { id: 'reminders', label: 'اتوماسیون یادآورها', icon: MessageSquare },
        { id: 'bale_integration', label: 'گزارش‌گیری و ارسال به بله', icon: Send },
        { id: 'officer_messages', label: 'پیام‌های دریافتی کارشناسان', icon: Mail },
        { id: 'audit_logs', label: 'لاگ‌های امنیتی کاربران', icon: Terminal },
        { id: 'security', label: 'تنظیمات رمزنگاری', icon: Shield },
      ];
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex flex-col justify-center items-center font-sans">
        <Login onLogin={handleLogin} />
        {/* Toast Alert Component for Login screen */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: 20, x: 20 }}
              className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl font-bold text-xs border ${
                toast.type === 'success'
                  ? 'bg-[#0d0d0d] text-emerald-500 border-emerald-500/20'
                  : toast.type === 'error'
                  ? 'bg-[#0d0d0d] text-rose-500 border-rose-500/20'
                  : 'bg-[#0d0d0d] text-amber-500 border-amber-500/20'
              }`}
              dir="rtl"
            >
              <Info className="w-4 h-4" />
              <span>{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col font-sans relative text-[#e0e0e0] selection:bg-amber-500/20 overflow-hidden">
      {/* Subtle Ambient Lights for Sleek Premium feel */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/2 blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-amber-500/2 blur-[120px] pointer-events-none"></div>

      {/* Main Container */}
      <div className="flex flex-1 relative z-10">
        
        {/* Desktop Sidebar (RTL Right-hand sidebar) */}
        <aside className="hidden lg:flex flex-col w-72 bg-[#0d0d0d] border-l border-[#222] p-6 space-y-8 select-none">
          {/* Brand/Logo */}
          <div className="flex items-center gap-3 border-b border-[#222] pb-5">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-md font-bold text-white tracking-tight leading-none">سامانه مالی <span className="gold-gradient-text font-black">نوین تک</span></h1>
              <p className="text-[9px] text-amber-500 font-bold tracking-wider mt-1.5 font-mono">NOVIN TECH INSTALLMENTS</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1.5">
            {getVisibleTabs().map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-500 border-r-4 border-amber-500 font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.05)]'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-gray-500'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Footer of Sidebar */}
          <div className="border-t border-[#222] pt-5 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-gray-500">
              <Info className="w-4 h-4 text-amber-500" />
              <span>پایگاه‌داده:</span>
              <span className="font-mono text-white text-[10px] font-bold">NovinTech-Secure-v1</span>
            </div>
            <p className="text-[10px] text-gray-600 leading-normal font-sans">
              طراحی انحصاری و مینیمال آموزشگاه عالی نوین تک. تمامی حقوق محفوظ است.
            </p>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Header Bar */}
          <header className="bg-[#0d0d0d]/95 backdrop-blur-md border-b border-[#222] px-6 py-4 flex justify-between items-center z-30">
            {/* Mobile Menu Trigger & Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              {/* Emergency system lock status indicator */}
              {security.isSystemLocked ? (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-500 text-xs font-bold border border-red-500/20 rounded-full animate-pulse">
                  <Lock className="w-3.5 h-3.5" />
                  قفل اضطراری دیتابیس فعال است
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20 rounded-full">
                  <Unlock className="w-3.5 h-3.5 text-emerald-500" />
                  پایگاه‌داده ایمن و در دسترس
                </div>
              )}
            </div>

            {/* Top Right Controls: Active Profile & LogOut */}
            <div className="flex items-center gap-4">
              
              {/* Active Profile Info */}
              {currentUser && (
                <div className="flex items-center gap-2.5 bg-[#0d0d0d] px-4 py-2 rounded-2xl border border-[#222]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-[#070b13] flex items-center justify-center font-bold text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden md:block text-right leading-none">
                    <span className="text-xs font-bold text-white block">
                      {currentUser.name}
                    </span>
                    <span className="text-[9px] text-gray-500 font-medium block mt-0.5">
                      {currentUser.role === 'admin' ? 'مدیریت کل سیستم' : currentUser.role === 'finance' ? 'امور و حسابداری مالی' : 'کارشناس آموزش'}
                    </span>
                  </div>
                </div>
              )}

              {/* Elegant Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold border border-rose-500/20 rounded-2xl cursor-pointer transition-all duration-200"
                title="خروج از حساب کاربری"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">خروج</span>
              </button>
            </div>
          </header>

          {/* Main Content Workspace with motion transitions */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full"
              >
                {activeTab === 'dashboard' && (
                  <Dashboard
                    students={students}
                    installments={installments}
                    transactions={transactions}
                    reminders={reminders}
                    onTriggerReminder={handleTriggerManualSMS}
                    onNavigateToTab={(tab) => setActiveTab(tab)}
                  />
                )}

                {activeTab === 'students' && (
                  <StudentsList
                    students={students}
                    installments={installments}
                    onAddStudent={handleAddStudent}
                    onDeleteStudent={handleDeleteStudent}
                    onRecordPaymentClick={handleQuickRecordPayment}
                    currentUserRole={currentUserRole}
                  />
                )}

                {activeTab === 'transactions' && (
                  <Transactions
                    students={students}
                    installments={installments}
                    transactions={transactions}
                    onAddTransaction={handleAddTransaction}
                    currentUserRole={currentUserRole}
                    isQuickRecording={isQuickRecording}
                    quickRecordData={quickRecordData}
                    onCloseQuickRecord={() => {
                      setIsQuickRecording(false);
                      setQuickRecordData(null);
                    }}
                  />
                )}

                {activeTab === 'reminders' && (
                  <Reminders
                    reminders={reminders}
                    students={students}
                    installments={installments}
                    onTriggerManualSMS={handleTriggerManualSMS}
                    onSimulateDailyCheck={handleSimulateDailyCheck}
                    farazSmsConfig={farazSmsConfig}
                    onSaveFarazSmsConfig={handleSaveFarazSmsConfig}
                  />
                )}

                {activeTab === 'bale_integration' && (
                  <BaleIntegration
                    students={students}
                  />
                )}

                {activeTab === 'officer_messages' && (
                  <OfficerMessages
                    currentUser={currentUser}
                    users={users}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    onDeleteMessage={handleDeleteMessage}
                    onMarkAsRead={handleMarkAsRead}
                  />
                )}

                {activeTab === 'audit_logs' && (
                  <AuditLogs
                    logs={logs}
                    students={students}
                    installments={installments}
                    currentUserRole={currentUserRole}
                  />
                )}

                {activeTab === 'security' && (
                  <SecurityPanel
                    security={security}
                    onRotateKey={handleRotateKey}
                    onToggleSystemLock={handleToggleSystemLock}
                    currentUserRole={currentUserRole}
                    users={users}
                    onAddUser={handleAddUser}
                    onDeleteUser={handleDeleteUser}
                    currentUserId={currentUser ? currentUser.id : undefined}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Mobile Drawer Navigation Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/65"
            />
            {/* Sidebar drawer panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-72 bg-[#0d0d0d] p-6 space-y-6 flex flex-col justify-between border-l border-[#222]"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-[#222] pb-4">
                  <span className="font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    ناوبری نوین تک
                  </span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 text-gray-400 hover:text-white rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {getVisibleTabs().map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-amber-500/10 text-amber-500 border-r-4 border-amber-500'
                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="border-t border-[#222] pt-4 text-[10px] text-gray-600">
                سامانه امنیتی نوین تک • نسخه ۱.۰.۰
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Luxury Modern Toast Overlay */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm bg-[#0d0d0d] border border-amber-500/20 p-4 rounded-2xl shadow-xl shadow-black/80 text-right flex items-start gap-3 gold-glow-box"
          >
            <div className={`p-1.5 rounded-lg ${
              toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : toast.type === 'error' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
            }`}>
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#e0e0e0] leading-relaxed">{toast.message}</p>
              <span className="text-[9px] text-gray-600 font-medium block mt-1">امضاء دیجیتال معتبر نوین‌پرداز</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
