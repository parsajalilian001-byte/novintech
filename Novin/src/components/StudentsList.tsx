/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  UserPlus,
  BookOpen,
  Phone,
  CreditCard,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  FileSpreadsheet,
  FileText,
  Calendar,
} from 'lucide-react';
import { Student, Installment, UserRole } from '../types';
import { formatRial, toPersianDigits, getStatusBadge, exportToCSV } from '../utils';
import { coursesList as ALL_COURSES } from '../data/courses';

interface StudentsListProps {
  students: Student[];
  installments: Installment[];
  onAddStudent: (student: Omit<Student, 'id' | 'studentCode' | 'remainingAmount' | 'createdAt'>, customInstallments: { amount: number; dueDate: string }[]) => void;
  onDeleteStudent: (id: string) => void;
  onRecordPaymentClick: (studentId: string, installmentId: string) => void;
  currentUserRole: UserRole;
}

export default function StudentsList({
  students,
  installments,
  onAddStudent,
  onDeleteStudent,
  onRecordPaymentClick,
  currentUserRole,
}: StudentsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  
  // Registration form states
  const [isRegistering, setIsRegistering] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNationalId, setNewNationalId] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCourse, setNewCourse] = useState(ALL_COURSES[0] || '');
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [newTotalAmount, setNewTotalAmount] = useState<number>(12000000);
  
  // Customizable Installments constructor
  const [customInsts, setCustomInsts] = useState<{ amount: number; dueDate: string }[]>([
    { amount: 4000000, dueDate: '1405/04/15' },
    { amount: 4000000, dueDate: '1405/05/15' },
    { amount: 4000000, dueDate: '1405/06/15' },
  ]);

  // Handle adding an installment input row
  const handleAddCustomInstallmentRow = () => {
    // Distribute remaining amount or default 1,000,000
    const sumCurrent = customInsts.reduce((sum, item) => sum + item.amount, 0);
    const remainder = Math.max(0, newTotalAmount - sumCurrent);
    const nextMonth = customInsts.length + 4;
    setCustomInsts([
      ...customInsts,
      { amount: remainder > 0 ? remainder : 2000000, dueDate: `1405/0${nextMonth > 9 ? nextMonth : '0' + nextMonth}/15` },
    ]);
  };

  const handleRemoveCustomInstallmentRow = (index: number) => {
    if (customInsts.length <= 1) return;
    setCustomInsts(customInsts.filter((_, i) => i !== index));
  };

  const handleUpdateCustomInstallment = (index: number, field: 'amount' | 'dueDate', value: any) => {
    const updated = [...customInsts];
    if (field === 'amount') {
      updated[index].amount = Number(value);
    } else {
      updated[index].dueDate = value;
    }
    setCustomInsts(updated);
  };

  const installmentSum = useMemo(() => {
    return customInsts.reduce((sum, item) => sum + item.amount, 0);
  }, [customInsts]);

  // Submit new student registration
  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newNationalId || !newPhone) {
      alert('لطفاً تمامی فیلدهای الزامی را تکمیل کنید.');
      return;
    }

    onAddStudent(
      {
        name: newName,
        nationalId: newNationalId,
        phone: newPhone,
        courseName: newCourse,
        totalAmount: newTotalAmount,
      },
      customInsts
    );

    // Reset Form
    setNewName('');
    setNewNationalId('');
    setNewPhone('');
    setNewTotalAmount(12000000);
    setNewCourse(ALL_COURSES[0] || '');
    setCourseSearchQuery('');
    setIsCourseDropdownOpen(false);
    setCustomInsts([
      { amount: 4000000, dueDate: '1405/04/15' },
      { amount: 4000000, dueDate: '1405/05/15' },
      { amount: 4000000, dueDate: '1405/06/15' },
    ]);
    setIsRegistering(false);
  };

  // Filter courses list for registration search
  const filteredCoursesForReg = useMemo(() => {
    if (!courseSearchQuery) return ALL_COURSES;
    return ALL_COURSES.filter((c) =>
      c.toLowerCase().includes(courseSearchQuery.toLowerCase())
    );
  }, [courseSearchQuery]);

  // Filter courses list for main page filter based on actual students' courses
  const coursesList = useMemo(() => {
    const courses = new Set(students.map((s) => s.courseName));
    return Array.from(courses);
  }, [students]);

  // Filter and search logic
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.includes(searchQuery) ||
        s.studentCode.includes(searchQuery) ||
        s.nationalId.includes(searchQuery) ||
        s.phone.includes(searchQuery);

      const matchesCourse = courseFilter === 'all' || s.courseName === courseFilter;

      return matchesSearch && matchesCourse;
    });
  }, [students, searchQuery, courseFilter]);

  // Selected student's active dossier details
  const activeDossier = useMemo(() => {
    if (!selectedStudentId) return null;
    const student = students.find((s) => s.id === selectedStudentId);
    if (!student) return null;

    const studentInstallments = installments.filter((i) => i.studentId === selectedStudentId);
    const paidSum = studentInstallments
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + i.amount, 0);

    return {
      student,
      installments: studentInstallments,
      paidSum,
      remainingAmount: student.totalAmount - paidSum,
    };
  }, [selectedStudentId, students, installments]);

  const handleExportStudents = () => {
    const list = filteredStudents.map((s) => ({
      'نام و نام خانوادگی': s.name,
      'شماره دانشجویی': s.studentCode,
      'کد ملی': s.nationalId,
      'تلفن همراه': s.phone,
      'دوره ثبت‌نامی': s.courseName,
      'کل شهریه (ریال)': s.totalAmount,
      'مانده بدهی (ریال)': s.remainingAmount,
      'تاریخ ثبت‌نام': s.createdAt,
    }));
    exportToCSV(list, 'لیست_پرونده_های_مالی_نوین_تک', [
      'نام و نام خانوادگی',
      'شماره دانشجویی',
      'کد ملی',
      'تلفن همراه',
      'دوره ثبت‌نامی',
      'کل شهریه (ریال)',
      'مانده بدهی (ریال)',
      'تاریخ ثبت‌نام',
    ]);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0d0d0d] p-6 rounded-3xl border border-[#222]">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            دایرکتوری پرونده‌های مالی و ثبت‌نام دانشجویان
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            امکان تعریف دوره‌ها، ثبت اطلاعات اولیه و پیاده‌سازی اقساط منعطف با سررسیدهای دلخواه
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsRegistering(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-full transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.25)]"
          >
            <UserPlus className="w-4 h-4" />
            ثبت‌نام و قسط‌بندی دانشجو
          </button>
          <button
            onClick={handleExportStudents}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#111] hover:bg-[#1a1a1a] border border-[#333] text-gray-300 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-500" />
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
            placeholder="جستجو بر اساس نام دانشجو، شماره دانشجویی، تلفن یا کد ملی..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-11 py-2.5 bg-[#0d0d0d] border border-[#222] rounded-full text-sm text-[#e0e0e0] placeholder-gray-600 focus:outline-none focus:border-amber-500/30 transition-all font-sans"
          />
        </div>
        {/* Course Filter */}
        <div className="relative">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-full px-5 py-2.5 bg-[#0d0d0d] border border-[#222] rounded-full text-sm text-[#e0e0e0] focus:outline-none focus:border-amber-500/30 transition-all appearance-none cursor-pointer font-sans"
          >
            <option value="all">همه دوره‌های آموزشی</option>
            {coursesList.map((course, idx) => (
              <option key={idx} value={course}>
                {course}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
        </div>
      </div>

      {/* Main Grid: Student list on right, dossier view on left */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* List of Students */}
        <div className="lg:col-span-3 bg-[#0d0d0d] border border-[#222] rounded-3xl overflow-hidden">
          <div className="p-4 bg-[#111] border-b border-[#222] font-bold text-xs text-amber-500">
            لیست پرونده‌های جاری ({toPersianDigits(filteredStudents.length)} پرونده)
          </div>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-gray-600 text-sm">
              <Search className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              هیچ موردی منطبق با جستجوی شما یافت نشد.
            </div>
          ) : (
            <div className="divide-y divide-[#222] max-h-[500px] overflow-y-auto">
              {filteredStudents.map((student) => {
                const isSelected = selectedStudentId === student.id;
                // calculate bad status if any installment is overdue
                const studentInsts = installments.filter((i) => i.studentId === student.id);
                const hasOverdue = studentInsts.some((i) => i.status === 'overdue');

                return (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudentId(student.id)}
                    className={`p-4 flex justify-between items-center cursor-pointer transition-all ${
                      isSelected ? 'bg-amber-500/5 border-r-4 border-amber-500' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-white flex items-center gap-2">
                        {student.name}
                        {hasOverdue && (
                          <span className="px-1.5 py-0.5 bg-rose-500/10 text-[10px] text-rose-500 border border-rose-500/20 rounded-full font-normal">
                            دارای بدهی معوق
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3 text-amber-500/50" />
                        {student.courseName}
                      </p>
                      <div className="flex gap-4 text-[11px] text-gray-600 font-mono mt-1">
                        <span>شماره: {toPersianDigits(student.studentCode)}</span>
                        <span>کد ملی: {toPersianDigits(student.nationalId)}</span>
                      </div>
                    </div>
                    <div className="text-left space-y-1">
                      <div className="text-xs font-bold text-[#e0e0e0] font-mono">
                        {formatRial(student.totalAmount)}
                      </div>
                      <div className={`text-[10px] font-bold ${student.remainingAmount === 0 ? 'text-emerald-500' : 'text-amber-500'} font-mono`}>
                        {student.remainingAmount === 0 ? 'تسویه کامل' : `بدهی: ${formatRial(student.remainingAmount)}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Dossier Details */}
        <div className="lg:col-span-2">
          {activeDossier ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0d0d0d] border border-[#222] rounded-3xl p-6 space-y-6 gold-glow-box"
            >
              <div className="flex justify-between items-start border-b border-[#222] pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full font-bold">
                    پرونده مالی مستقل
                  </span>
                  <h3 className="text-md font-bold text-white mt-1.5">{activeDossier.student.name}</h3>
                  <p className="text-xs text-gray-500 font-mono flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-600" />
                    {toPersianDigits(activeDossier.student.phone)}
                  </p>
                </div>
                {/* Delete button (Strict role access check) */}
                {currentUserRole === 'admin' && (
                  <button
                    onClick={() => {
                      if (confirm('آیا از حذف کامل این پرونده مالی مطمئن هستید؟ این عمل غیرقابل بازگشت است.')) {
                        onDeleteStudent(activeDossier.student.id);
                        setSelectedStudentId(null);
                      }
                    }}
                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-500 rounded-xl transition-all cursor-pointer"
                    title="حذف پرونده مالی"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Dossier Finance Indicators */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#111] p-3.5 rounded-2xl border border-[#222] text-right">
                  <p className="text-gray-500 text-[10px] mb-1">مجموع شهریه دوره</p>
                  <span className="font-bold text-sm text-white font-mono">{formatRial(activeDossier.student.totalAmount)}</span>
                </div>
                <div className="bg-[#111] p-3.5 rounded-2xl border border-[#222] text-right">
                  <p className="text-gray-500 text-[10px] mb-1">مانده بدهی جاری</p>
                  <span className={`font-bold text-sm font-mono ${activeDossier.remainingAmount > 0 ? 'text-amber-500 animate-pulse' : 'text-emerald-500'}`}>
                    {formatRial(activeDossier.remainingAmount)}
                  </span>
                </div>
              </div>

              {/* Installment Plan Ledger */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400">برنامه زمان‌بندی اقساط منعطف</h4>
                <div className="space-y-3">
                  {activeDossier.installments.map((inst, index) => {
                    const badge = getStatusBadge(inst.status);
                    return (
                      <div
                        key={inst.id}
                        className="bg-[#111] border border-[#222] p-4 rounded-2xl flex justify-between items-center transition-all hover:border-amber-500/15"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#e0e0e0] font-mono">
                              قسط {toPersianDigits(index + 1)}: {formatRial(inst.amount)}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 font-mono flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-600" />
                            سررسید: {toPersianDigits(inst.dueDate)}
                          </p>
                          {inst.paymentDate && (
                            <p className="text-[10px] text-emerald-500 font-mono">
                              تاریخ پرداخت: {toPersianDigits(inst.paymentDate)}
                            </p>
                          )}
                        </div>
                        <div className="text-left space-y-2">
                          <div className={`px-2 py-1 rounded text-[10px] font-bold ${badge.bgClass} ${badge.textClass} inline-flex items-center gap-1`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                            {badge.text}
                          </div>
                          {inst.status !== 'paid' && (
                            <div>
                              <button
                                onClick={() => onRecordPaymentClick(activeDossier.student.id, inst.id)}
                                className="block w-full text-center px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] rounded-full transition-all duration-150 cursor-pointer shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                              >
                                ثبت وصول واریزی
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-[#0d0d0d] border border-[#222] rounded-3xl p-8 text-center text-sm text-gray-500 h-full flex flex-col justify-center items-center min-h-[300px]">
              <CreditCard className="w-12 h-12 text-gray-700 mb-3" />
              جهت مشاهده پرونده مالی دانشجو، برنامه اقساط، میزان بدهی و ثبت واریزی‌ها، یکی از پرونده‌های سمت راست را انتخاب کنید.
            </div>
          )}
        </div>
      </div>

      {/* Register & Flexible Installment Plan Constructor Modal */}
      <AnimatePresence>
        {isRegistering && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0d0d0d] border border-[#222] rounded-3xl p-6 sm:p-8 w-full max-w-2xl text-right max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-[#222] pb-4 mb-6">
                <h3 className="text-md font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-amber-500" />
                  پرونده جدید و قسط‌بندی اختصاصی دانشجو
                </h3>
                <button
                  onClick={() => setIsRegistering(false)}
                  className="p-1 text-gray-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitRegistration} className="space-y-6">
                {/* Profile Fields Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500">نام و نام خانوادگی دانشجو *</label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="مانند: محمد علیزاده"
                      className="w-full px-4 py-2.5 bg-[#111] border border-[#222] rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/30 transition-all font-sans"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500">کد ملی ده رقمی *</label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={newNationalId}
                      onChange={(e) => setNewNationalId(e.target.value)}
                      placeholder="مانند: 0012345678"
                      className="w-full px-4 py-2.5 bg-[#111] border border-[#222] rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-500/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500">شماره تلفن همراه *</label>
                    <input
                      type="text"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="مانند: 09123456789"
                      className="w-full px-4 py-2.5 bg-[#111] border border-[#222] rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-500/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5 relative">
                    <label className="text-xs text-gray-500">دوره آموزشی ثبت‌نامی *</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="جستجو و انتخاب دوره..."
                        value={courseSearchQuery}
                        onChange={(e) => {
                          setCourseSearchQuery(e.target.value);
                          setIsCourseDropdownOpen(true);
                        }}
                        onFocus={() => {
                          setIsCourseDropdownOpen(true);
                        }}
                        className="w-full px-4 py-2.5 bg-[#111] border border-[#222] rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/30 transition-all font-sans"
                      />
                      {newCourse && !courseSearchQuery && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-[#e0e0e0] font-sans truncate max-w-[85%]">
                          {newCourse}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amber-500 p-1"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {isCourseDropdownOpen && (
                      <div className="absolute z-[999] w-full mt-1 bg-[#111] border border-[#222] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] max-h-56 overflow-y-auto divide-y divide-[#1c1c1c]">
                        {filteredCoursesForReg.length === 0 ? (
                          <div className="px-4 py-3 text-xs text-gray-500 text-center font-sans">
                            دوره‌ای با این مشخصات یافت نشد
                          </div>
                        ) : (
                          filteredCoursesForReg.map((c, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setNewCourse(c);
                                setCourseSearchQuery('');
                                setIsCourseDropdownOpen(false);
                              }}
                              className={`w-full text-right px-4 py-2.5 text-xs font-sans transition-colors block ${
                                newCourse === c
                                  ? 'bg-amber-500/10 text-amber-500 font-bold'
                                  : 'text-gray-400 hover:bg-[#1c1c1c] hover:text-white'
                              }`}
                            >
                              {c}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#222] pt-5">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500">مجموع کل شهریه مصوب (ریال) *</label>
                    <input
                      type="number"
                      required
                      value={newTotalAmount}
                      onChange={(e) => setNewTotalAmount(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-[#111] border border-[#222] rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-500/30 transition-all"
                    />
                    <p className="text-[10px] text-gray-500">{formatRial(newTotalAmount)}</p>
                  </div>
                  <div className="bg-[#111] p-4 rounded-2xl border border-[#222] flex flex-col justify-center">
                    <span className="text-xs text-gray-500">وضعیت تطابق اقساط با کل شهریه:</span>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {installmentSum === newTotalAmount ? (
                        <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          کاملاً متطابق و تایید شده
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          اختلاف مبالغ اقساط: {formatRial(Math.abs(newTotalAmount - installmentSum))}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Customizable Installments constructor */}
                <div className="border-t border-[#222] pt-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-amber-500">تنظیم دستی ساختار و سررسیدهای اقساط</h4>
                    <button
                      type="button"
                      onClick={handleAddCustomInstallmentRow}
                      className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 rounded-full text-[10px] font-bold transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      افزودن بند قسط منعطف
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {customInsts.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-center bg-[#111] p-3 rounded-2xl border border-[#222]">
                        <span className="text-xs text-gray-500 font-mono w-12">قسط {toPersianDigits(idx + 1)}</span>
                        
                        <div className="flex-1">
                          <input
                            type="number"
                            required
                            placeholder="مبلغ قسط (ریال)"
                            value={item.amount}
                            onChange={(e) => handleUpdateCustomInstallment(idx, 'amount', e.target.value)}
                            className="w-full px-3 py-1.5 bg-black border border-[#222] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-amber-500/30"
                          />
                        </div>

                        <div className="flex-1">
                          <input
                            type="text"
                            required
                            placeholder="سررسید (مثال: 1405/04/15)"
                            value={item.dueDate}
                            onChange={(e) => handleUpdateCustomInstallment(idx, 'dueDate', e.target.value)}
                            className="w-full px-3 py-1.5 bg-black border border-[#222] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-amber-500/30"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveCustomInstallmentRow(idx)}
                          disabled={customInsts.length <= 1}
                          className="p-2 text-rose-500 hover:text-rose-400 disabled:opacity-40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#222] pt-5 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="px-4 py-2 bg-[#111] hover:bg-[#1a1a1a] text-gray-400 rounded-full text-xs font-bold transition-all cursor-pointer"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-full text-xs font-bold shadow-lg shadow-amber-500/15 transition-all cursor-pointer"
                  >
                    ثبت و آغاز فرآیند مالی مستقل
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
