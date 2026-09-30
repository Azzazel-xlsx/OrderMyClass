import React, { useState } from 'react';
import {
  User,
  Mail,
  Calendar,
  Clock,
  Award,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  calculateSkillScore,
  calculateFinalGrade,
  calculateStudentAttendance,
} from '../utils/gradeCalculations';
import { Button } from '../components/common/Button';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { StudentFormModal } from '../components/students/StudentFormModal';

interface StudentProfileViewProps {
  studentId: string;
  courseId: string;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  studentId,
  courseId,
}) => {
  const {
    students,
    courses,
    gradeHistory,
    updateStudent,
    deleteStudent,
    navigateBack,
    navigateTo,
  } = useApp();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const student = students.find((s) => s.id === studentId);
  const course = courses.find((c) => c.id === courseId);

  if (!student || !course) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
        <p className="text-sm text-slate-500">Estudiante o curso no encontrado.</p>
        <Button variant="secondary" size="sm" onClick={navigateBack} className="mt-3">
          Regresar
        </Button>
      </div>
    );
  }

  const listening = calculateSkillScore(student, course, 'listening');
  const reading = calculateSkillScore(student, course, 'reading');
  const speaking = calculateSkillScore(student, course, 'speaking');
  const finalGrade = calculateFinalGrade(student, course);
  const { percentage: attPct, presentCount, totalSessions } = calculateStudentAttendance(student);

  // Student specific grade history entries
  const studentHistory = gradeHistory
    .filter((h) => h.studentId === student.id)
    .slice(0, 10);

  // Attendance dates sorted descending
  const attendanceDates = Object.entries(student.attendance || {}).sort(
    (a, b) => b[0].localeCompare(a[0])
  );

  // Calculation for SVG circle progress ring
  const maxScore = course.gradeScale === '100' ? 100 : 10;
  const gradePct = finalGrade !== null ? Math.min(100, (finalGrade / maxScore) * 100) : 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (gradePct / 100) * circumference;

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Student Top Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-full bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 border-4 border-white dark:border-slate-800">
            {student.name
              .split(' ')
              .map((w) => w[0])
              .slice(0, 2)
              .join('')}
          </div>
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
          {student.name}
        </h2>
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
          Estudiante · {course.name}
        </span>
        {student.email && (
          <span className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <Mail className="w-3.5 h-3.5" />
            {student.email}
          </span>
        )}

        {/* 3 Skill score pills */}
        <div className="grid grid-cols-3 gap-2.5 w-full mt-5">
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 flex flex-col items-center">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              Listening
            </span>
            <strong className="text-lg font-black text-slate-900 dark:text-white mt-0.5 tabular-nums">
              {listening !== null ? listening.toFixed(1) : '-'}
            </strong>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 flex flex-col items-center">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Reading
            </span>
            <strong className="text-lg font-black text-slate-900 dark:text-white mt-0.5 tabular-nums">
              {reading !== null ? reading.toFixed(1) : '-'}
            </strong>
          </div>

          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900 flex flex-col items-center">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
              Speaking
            </span>
            <strong className="text-lg font-black text-slate-900 dark:text-white mt-0.5 tabular-nums">
              {speaking !== null ? speaking.toFixed(1) : '-'}
            </strong>
          </div>
        </div>

        {/* Large Animated Circular Final Grade Ring (Screen 8) */}
        <div className="relative w-44 h-44 my-4 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
            {/* Background ring */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              className="text-slate-100 dark:text-slate-800"
              fill="transparent"
            />
            {/* Animated progress ring */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              className="text-emerald-500 transition-all duration-1000 ease-out"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums leading-none">
              {finalGrade !== null ? finalGrade.toFixed(1) : '-'}
            </span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              Nota final
            </span>
          </div>
        </div>

        {/* Attendance card */}
        <div className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-xs">
              {attPct}%
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Asistencia general
              </span>
              <span className="text-[11px] text-slate-400">
                {presentCount} de {totalSessions} clases asistidas
              </span>
            </div>
          </div>
          <button
            onClick={() =>
              navigateTo({
                type: 'attendance-history',
                courseId: course.id,
              })
            }
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Historial →
          </button>
        </div>
      </div>

      {/* Grade History Log */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-3">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          <span>Historial de calificaciones</span>
        </h3>

        {studentHistory.length > 0 ? (
          <div className="flex flex-col gap-2">
            {studentHistory.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {item.subGradeName} ({item.skill})
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {new Date(item.timestamp).toLocaleString('es-ES', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-bold tabular-nums">
                  <span className="text-slate-400">
                    {item.oldScore !== null ? item.oldScore : '-'}
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-blue-600 dark:text-blue-400">
                    {item.newScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-2">
            No hay modificaciones recientes en las notas de este alumno.
          </p>
        )}
      </div>

      {/* Recent Attendance Log */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-3">
          <Calendar className="w-4 h-4 text-emerald-500" />
          <span>Registro de asistencia reciente</span>
        </h3>

        {attendanceDates.length > 0 ? (
          <div className="flex flex-col gap-2">
            {attendanceDates.slice(0, 5).map(([date, status]) => (
              <div
                key={date}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs"
              >
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {date}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full font-bold text-[11px] flex items-center gap-1 ${
                    status === 'present'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {status === 'present' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Presente</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Ausente</span>
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-1">
            Sin sesiones de asistencia registradas aún.
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          fullWidth
          onClick={() => setEditModalOpen(true)}
        >
          <Edit2 className="w-4 h-4 mr-1.5" />
          Editar estudiante
        </Button>
        <Button
          variant="danger"
          fullWidth
          onClick={() => setDeleteConfirmOpen(true)}
        >
          <Trash2 className="w-4 h-4 mr-1.5" />
          Eliminar
        </Button>
      </div>

      {/* Edit Modal */}
      <StudentFormModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={(data) => {
          updateStudent(student.id, data);
        }}
        initialData={student}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => {
          deleteStudent(student.id);
          navigateBack();
        }}
        title="¿Eliminar estudiante?"
        message={`Se eliminarán todas las notas y asistencias de "${student.name}".`}
        confirmText="Eliminar estudiante"
        isDestructive
      />
    </div>
  );
};
