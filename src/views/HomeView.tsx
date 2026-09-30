import React from 'react';
import {
  Users,
  BookOpen,
  Clock,
  CheckCircle2,
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COURSE_COLORS } from '../utils/themeColors';
import {
  calculateCourseAverage,
  calculateCourseAttendanceRate,
} from '../utils/gradeCalculations';
import { getNextClass } from '../utils/scheduleUtils';
import { Button } from '../components/common/Button';

export const HomeView: React.FC = () => {
  const { courses, students, teacher, navigateTo } = useApp();

  // Next class calculation
  const nextClass = getNextClass(courses);

  // Overall calculations across all courses
  const totalCourses = courses.length;
  const totalStudents = students.length;

  // Overall attendance calculation
  let totalAttendancesRecorded = 0;
  let totalAttendancesPresent = 0;
  for (const st of students) {
    const recs = Object.values(st.attendance || {});
    for (const r of recs) {
      totalAttendancesRecorded++;
      if (r === 'present') totalAttendancesPresent++;
    }
  }
  const overallAttendancePct =
    totalAttendancesRecorded > 0
      ? Math.round((totalAttendancesPresent / totalAttendancesRecorded) * 100)
      : 92;

  // Overall grade average across all courses
  const allCourseAverages: number[] = [];
  for (const course of courses) {
    const avg = calculateCourseAverage(students, course);
    if (avg !== null) allCourseAverages.push(avg);
  }
  const generalAverage =
    allCourseAverages.length > 0
      ? Number(
          (
            allCourseAverages.reduce((a, b) => a + b, 0) / allCourseAverages.length
          ).toFixed(1)
        )
      : 8.4;

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Greeting Banner */}
      <div className="pt-1">
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          ¡Hola, {teacher.name.split(' ')[0]}!
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Aquí tienes un resumen de tu jornada académica.
        </p>
      </div>

      {/* Top 3 Stat Cards (Cursos, Estudiantes, Próxima clase) matching Screen 1 */}
      <div className="grid grid-cols-3 gap-2">
        {/* Cursos */}
        <div
          onClick={() => navigateTo({ type: 'tab', tab: 'courses' })}
          className="p-3.5 rounded-3xl bg-blue-600 text-white flex flex-col justify-between h-28 shadow-sm shadow-blue-500/20 cursor-pointer active:scale-98 transition-transform"
        >
          <div className="flex items-center justify-between text-blue-100">
            <span className="text-[11px] font-bold">Cursos</span>
            <BookOpen className="w-4 h-4 opacity-80" />
          </div>
          <div>
            <strong className="text-2xl font-black block leading-none">
              {totalCourses}
            </strong>
            <span className="text-[10px] text-blue-100 mt-1 block">Activos</span>
          </div>
        </div>

        {/* Estudiantes */}
        <div
          onClick={() => navigateTo({ type: 'tab', tab: 'courses' })}
          className="p-3.5 rounded-3xl bg-emerald-600 text-white flex flex-col justify-between h-28 shadow-sm shadow-emerald-500/20 cursor-pointer active:scale-98 transition-transform"
        >
          <div className="flex items-center justify-between text-emerald-100">
            <span className="text-[11px] font-bold">Estudiantes</span>
            <Users className="w-4 h-4 opacity-80" />
          </div>
          <div>
            <strong className="text-2xl font-black block leading-none">
              {totalStudents}
            </strong>
            <span className="text-[10px] text-emerald-100 mt-1 block">En total</span>
          </div>
        </div>

        {/* Próxima clase */}
        <div
          onClick={() => navigateTo({ type: 'tab', tab: 'schedule' })}
          className="p-3.5 rounded-3xl bg-purple-600 text-white flex flex-col justify-between h-28 shadow-sm shadow-purple-500/20 cursor-pointer active:scale-98 transition-transform"
        >
          <div className="flex items-center justify-between text-purple-100">
            <span className="text-[11px] font-bold">Próxima clase</span>
            <Clock className="w-4 h-4 opacity-80" />
          </div>
          <div>
            <strong className="text-lg font-black block leading-none truncate">
              {nextClass ? nextClass.timeStr : '08:00'}
            </strong>
            <span className="text-[10px] text-purple-100 mt-1 block truncate">
              {nextClass
                ? `${nextClass.course.name.split(' ')[0]} · ${nextClass.dayShort}`
                : 'Sin horario'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom 2 Stat Cards (Asistencia & Promedio general) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Asistencia */}
        <div
          onClick={() => navigateTo({ type: 'tab', tab: 'attendance' })}
          className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-3 cursor-pointer active:scale-98 transition-transform"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
              Asistencia
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <strong className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
                {overallAttendancePct}%
              </strong>
              <span className="text-[10px] font-bold text-emerald-600">↑+2%</span>
            </div>
          </div>
        </div>

        {/* Promedio general */}
        <div
          onClick={() => navigateTo({ type: 'tab', tab: 'courses' })}
          className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-3 cursor-pointer active:scale-98 transition-transform"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
              Promedio general
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <strong className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
                {generalAverage}
              </strong>
              <span className="text-[10px] font-bold text-amber-600">↑+0.3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mis Cursos Header */}
      <div className="flex items-center justify-between px-1 pt-1">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
          Mis cursos
        </h3>
        <button
          onClick={() => navigateTo({ type: 'tab', tab: 'courses' })}
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          <span>Ver todos</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of Courses (2 columns in mobile or cards) matching Screen 1 */}
      <div className="grid grid-cols-2 gap-2.5">
        {courses.slice(0, 4).map((course) => {
          const colorScheme = COURSE_COLORS[course.color] || COURSE_COLORS.blue;
          const cStudents = students.filter((s) => s.courseId === course.id);
          const cAvg = calculateCourseAverage(students, course);
          const cAtt = calculateCourseAttendanceRate(students, course.id);

          return (
            <div
              key={course.id}
              onClick={() =>
                navigateTo({ type: 'course-detail', courseId: course.id })
              }
              className="p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer active:scale-98 flex flex-col justify-between h-36"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-white text-[11px] font-extrabold ${colorScheme.bg}`}
                  >
                    {course.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    {cAtt}%
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {course.name}
                </h4>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {cStudents.length} estudiantes
                </span>
              </div>

              <div className="pt-2 border-t border-slate-50 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Promedio:</span>
                <span className="font-extrabold text-blue-600 dark:text-blue-400 tabular-nums">
                  {cAvg !== null ? cAvg.toFixed(1) : '-'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Big "+ Crear curso" button matching Screen 1 */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={() => navigateTo({ type: 'tab', tab: 'courses' })}
        className="mt-1 shadow-md shadow-blue-600/20"
      >
        <Plus className="w-5 h-5 mr-1" />
        <span>Crear curso</span>
      </Button>
    </div>
  );
};
