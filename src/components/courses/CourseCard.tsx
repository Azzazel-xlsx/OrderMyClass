import React, { useState } from 'react';
import { Users, MoreVertical, Edit2, Trash2, Calendar, Star, Clock, ChevronRight } from 'lucide-react';
import { Course } from '../../types';
import { useApp } from '../../context/AppContext';
import { COURSE_COLORS } from '../../utils/themeColors';
import { calculateCourseAverage, calculateCourseAttendanceRate } from '../../utils/gradeCalculations';
import { getNextClass } from '../../utils/scheduleUtils';

interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onEdit, onDelete }) => {
  const { students, navigateTo } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  const courseStudents = students.filter((s) => s.courseId === course.id);
  const avgGrade = calculateCourseAverage(students, course);
  const attendanceRate = calculateCourseAttendanceRate(students, course.id);
  const nextClass = getNextClass([course], course.id);

  const colorScheme = COURSE_COLORS[course.color] || COURSE_COLORS.blue;
  const initials = course.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      onClick={() => navigateTo({ type: 'course-detail', courseId: course.id })}
      className="relative group bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-100 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Course icon & info */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm ${colorScheme.bg}`}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate leading-snug">
              {course.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {courseStudents.length} estudiantes
              </span>
              <span>·</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {avgGrade !== null ? avgGrade.toFixed(1) : '-'}
              </span>
              {attendanceRate !== null && (
                <>
                  <span>·</span>
                  <span
                    className={`font-semibold ${
                      attendanceRate >= 90
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : attendanceRate >= 75
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {attendanceRate}%
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Menu Button */}
        <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Opciones del curso"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-9 z-30 w-36 bg-white dark:bg-slate-850 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-1 overflow-hidden">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(course);
                  }}
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-left"
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(course);
                  }}
                  className="w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 text-left"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Eliminar</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Next Class pill line */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {nextClass ? (
            <span>
              Siguiente:{' '}
              <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                {nextClass.dayShort} {nextClass.timeStr}
              </strong>
            </span>
          ) : (
            <span className="text-slate-400">Sin horario asignado</span>
          )}
        </div>
        <div className="text-slate-400 group-hover:text-blue-500 transition-colors flex items-center gap-0.5 text-[11px] font-semibold">
          <span>Abrir</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
