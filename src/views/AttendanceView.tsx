import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Calendar as CalendarIcon,
  CheckSquare,
  Users,
  Filter,
  Save,
  Clock,
  History,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AttendanceStatus, Course } from '../types';
import { Button } from '../components/common/Button';
import { DAY_SHORT_ES } from '../utils/scheduleUtils';

// Helper to format Date to YYYY-MM-DD
function formatDateToISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const AttendanceView: React.FC<{ initialCourseId?: string; initialDate?: string }> = ({
  initialCourseId,
  initialDate,
}) => {
  const { courses, students, attendanceDays, saveAttendanceForDate, showToast } = useApp();

  // Active course
  const [selectedCourseId, setSelectedCourseId] = useState<string>(() => {
    if (initialCourseId && courses.some((c) => c.id === initialCourseId)) {
      return initialCourseId;
    }
    return courses[0]?.id || '';
  });

  // Calendar current browsing month
  const [browseDate, setBrowseDate] = useState<Date>(() => {
    if (initialDate) return new Date(initialDate + 'T12:00:00');
    // Default to Sept 2026 or current date
    return new Date(2026, 8, 30); // Sept 30, 2026 matching screenshots
  });

  // Selected date for attendance sheet
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return initialDate || '2026-09-30';
  });

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const courseStudents = useMemo(() => {
    if (!selectedCourse) return [];
    return students.filter((s) => s.courseId === selectedCourse.id);
  }, [students, selectedCourse]);

  // Current attendance record state for selected date & course
  const existingRecord = useMemo(() => {
    return attendanceDays.find(
      (a) => a.courseId === selectedCourseId && a.date === selectedDate
    );
  }, [attendanceDays, selectedCourseId, selectedDate]);

  // Local state for the attendance roll call
  const [rollCall, setRollCall] = useState<Record<string, AttendanceStatus>>({});

  // Sync roll call when date, course, or existing records change
  React.useEffect(() => {
    if (existingRecord) {
      setRollCall({ ...existingRecord.records });
    } else {
      // Default: check if students already have attendance on this date in their profile
      const defaults: Record<string, AttendanceStatus> = {};
      for (const st of courseStudents) {
        defaults[st.id] = st.attendance[selectedDate] || 'present';
      }
      setRollCall(defaults);
    }
  }, [selectedCourseId, selectedDate, existingRecord, courseStudents]);

  // Calendar calculation
  const calendarDays = useMemo(() => {
    const year = browseDate.getFullYear();
    const month = browseDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Monday-based day of week (0 = Monday, 6 = Sunday)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Days from previous month to fill row
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, d);
      days.push({
        dateStr: formatDateToISO(prevDate),
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    // Days in current month
    for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
      const curDate = new Date(year, month, d);
      days.push({
        dateStr: formatDateToISO(curDate),
        dayNum: d,
        isCurrentMonth: true,
      });
    }

    // Days from next month to complete 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        dateStr: formatDateToISO(nextDate),
        dayNum: i,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [browseDate]);

  // Indicator mapping for each date in selected course
  // 'all-present' | 'some-absent' | 'none'
  const dateIndicators = useMemo(() => {
    const map: Record<string, 'all-present' | 'some-absent'> = {};
    for (const record of attendanceDays) {
      if (record.courseId === selectedCourseId) {
        const statuses = Object.values(record.records);
        if (statuses.length > 0) {
          const hasAbsence = statuses.some((s) => s === 'absent');
          map[record.date] = hasAbsence ? 'some-absent' : 'all-present';
        }
      }
    }
    return map;
  }, [attendanceDays, selectedCourseId]);

  // Navigation across months
  const handlePrevMonth = () => {
    setBrowseDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setBrowseDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Roll call actions
  const handleToggleStudent = (studentId: string) => {
    setRollCall((prev) => {
      const current = prev[studentId] || 'present';
      return {
        ...prev,
        [studentId]: current === 'present' ? 'absent' : 'present',
      };
    });
  };

  const handleMarkAllPresent = () => {
    const all: Record<string, AttendanceStatus> = {};
    courseStudents.forEach((s) => {
      all[s.id] = 'present';
    });
    setRollCall(all);
    showToast({
      type: 'info',
      message: 'Todos los estudiantes marcados como presentes.',
    });
  };

  const handleMarkAllAbsent = () => {
    const all: Record<string, AttendanceStatus> = {};
    courseStudents.forEach((s) => {
      all[s.id] = 'absent';
    });
    setRollCall(all);
    showToast({
      type: 'info',
      message: 'Todos los estudiantes marcados como ausentes.',
    });
  };

  const handleSave = () => {
    if (!selectedCourse) return;
    saveAttendanceForDate(selectedCourse.id, selectedDate, rollCall);
  };

  // Stats for the active day
  const presentCount = Object.values(rollCall).filter((s) => s === 'present').length;
  const totalCount = courseStudents.length;
  const attendancePercent = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 100;

  // Selected date formatted in Spanish
  const [sYear, sMonth, sDay] = selectedDate.split('-').map(Number);
  const selectedDateObj = new Date(sYear, sMonth - 1, sDay);
  const dayNameSpanish = [
    'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
  ][selectedDateObj.getDay()];

  return (
    <div className="flex flex-col gap-4 pb-36">
      {/* Course Selector Dropdown / Pill */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-100 dark:border-slate-800 shadow-xs">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 pl-2">
          Curso:
        </span>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white px-3 py-2 rounded-2xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.level})
            </option>
          ))}
        </select>
      </div>

      {/* Calendar Card (Screen 5 & 9) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs">
        {/* Month Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handlePrevMonth}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {monthNames[browseDate.getMonth()]} {browseDate.getFullYear()}
          </h3>

          <button
            onClick={handleNextMonth}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {calendarDays.map((day, idx) => {
            const isSelected = day.dateStr === selectedDate;
            const indicator = dateIndicators[day.dateStr];

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(day.dateStr)}
                className={`relative h-10 rounded-2xl flex flex-col items-center justify-center text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white font-extrabold shadow-sm shadow-blue-500/30 scale-105 z-10'
                    : day.isCurrentMonth
                    ? 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    : 'text-slate-300 dark:text-slate-600'
                }`}
              >
                <span>{day.dayNum}</span>

                {/* Status Dot */}
                {indicator && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
                      isSelected
                        ? 'bg-white'
                        : indicator === 'all-present'
                        ? 'bg-emerald-500'
                        : 'bg-rose-500'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend from Screen 9 */}
        <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Todas presentes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Alguna ausencia</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span>Sin registro</span>
          </div>
        </div>
      </div>

      {/* Date Header & Quick Actions */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">
              {dayNameSpanish}, {selectedDateObj.getDate()} de {monthNames[selectedDateObj.getMonth()].toLowerCase()}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {presentCount} de {totalCount} presentes ({attendancePercent}%)
            </span>
          </div>

          {/* Quick Mark Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleMarkAllPresent}
              className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:opacity-90 active:scale-95 transition-all"
            >
              Todos presentes
            </button>
            <button
              onClick={handleMarkAllAbsent}
              className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:opacity-90 active:scale-95 transition-all"
            >
              Todos ausentes
            </button>
          </div>
        </div>

        {/* Student Roll Call List matching Screen 5 */}
        <div className="flex flex-col gap-2">
          {courseStudents.map((student) => {
            const status = rollCall[student.id] || 'present';
            const isPresent = status === 'present';

            return (
              <div
                key={student.id}
                onClick={() => handleToggleStudent(student.id)}
                className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 active:scale-[0.99] transition-all"
              >
                {/* Avatar and Name */}
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
                    {student.name
                      .split(' ')
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {student.name}
                  </span>
                </div>

                {/* Toggle Status Pill */}
                <div
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isPresent
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {isPresent ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Presente</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Ausente</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Save Action */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent dark:from-slate-950 dark:via-slate-950/90 z-30 pointer-events-none">
        <div className="max-w-lg mx-auto pointer-events-auto">
          <Button
            variant="success"
            size="lg"
            fullWidth
            onClick={handleSave}
            className="shadow-lg shadow-emerald-600/30"
          >
            <Save className="w-5 h-5 mr-1.5" />
            <span>Guardar asistencia</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
