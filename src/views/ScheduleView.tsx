import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  AlertTriangle,
  MapPin,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Course, ScheduleBlock } from '../types';
import { COURSE_COLORS } from '../utils/themeColors';
import {
  DAY_NAMES_ES,
  findScheduleConflicts,
  getNextClass,
} from '../utils/scheduleUtils';
import { Button } from '../components/common/Button';
import { BottomSheet } from '../components/common/BottomSheet';
import { Input } from '../components/common/Input';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const ScheduleView: React.FC = () => {
  const {
    courses,
    addScheduleBlock,
    updateScheduleBlock,
    deleteScheduleBlock,
    navigateTo,
  } = useApp();

  // Week offset state (0 = current week, -1 = previous, +1 = next)
  const [weekOffset, setWeekOffset] = useState(0);

  // Form modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<{
    courseId: string;
    block: ScheduleBlock;
  } | null>(null);

  const [formCourseId, setFormCourseId] = useState(courses[0]?.id || '');
  const [formDay, setFormDay] = useState(1);
  const [formStart, setFormStart] = useState('08:00');
  const [formEnd, setFormEnd] = useState('09:00');
  const [formClassroom, setFormClassroom] = useState('Aula 101');

  const [deleteConfirm, setDeleteConfirm] = useState<{
    courseId: string;
    blockId: string;
  } | null>(null);

  // Calculate week dates
  const weekInfo = useMemo(() => {
    // Baseline anchor: week of Monday Sep 28, 2026
    const baseMonday = new Date(2026, 8, 28);
    const startOfWeek = new Date(baseMonday);
    startOfWeek.setDate(baseMonday.getDate() + weekOffset * 7);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const months = [
      'ene', 'feb', 'mar', 'abr', 'may', 'jun',
      'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
    ];

    const label = `Semana del ${startOfWeek.getDate()} ${months[startOfWeek.getMonth()]} - ${endOfWeek.getDate()} ${months[endOfWeek.getMonth()]}`;

    return { label, startOfWeek, endOfWeek };
  }, [weekOffset]);

  // Next upcoming class across all courses
  const nextClass = useMemo(() => getNextClass(courses), [courses]);

  // Conflicts check
  const conflicts = useMemo(() => findScheduleConflicts(courses), [courses]);

  // Group blocks by day of week (1 to 7)
  const blocksByDay = useMemo(() => {
    const map: Record<number, { block: ScheduleBlock; course: Course }[]> = {
      1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [],
    };

    for (const course of courses) {
      for (const block of course.schedule || []) {
        map[block.dayOfWeek]?.push({ block, course });
      }
    }

    // Sort by startTime
    for (let day = 1; day <= 7; day++) {
      map[day].sort((a, b) => a.block.startTime.localeCompare(b.block.startTime));
    }

    return map;
  }, [courses]);

  const handleOpenAdd = (defaultDay?: number) => {
    setEditingBlock(null);
    setFormCourseId(courses[0]?.id || '');
    setFormDay(defaultDay || 1);
    setFormStart('08:00');
    setFormEnd('09:00');
    setFormClassroom('');
    setModalOpen(true);
  };

  const handleOpenEdit = (courseId: string, block: ScheduleBlock) => {
    setEditingBlock({ courseId, block });
    setFormCourseId(courseId);
    setFormDay(block.dayOfWeek);
    setFormStart(block.startTime);
    setFormEnd(block.endTime);
    setFormClassroom(block.classroom || '');
    setModalOpen(true);
  };

  const handleSaveBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCourseId) return;

    if (editingBlock) {
      updateScheduleBlock(editingBlock.courseId, editingBlock.block.id, {
        dayOfWeek: formDay,
        startTime: formStart,
        endTime: formEnd,
        classroom: formClassroom.trim() || undefined,
      });
    } else {
      addScheduleBlock({
        courseId: formCourseId,
        dayOfWeek: formDay,
        startTime: formStart,
        endTime: formEnd,
        classroom: formClassroom.trim() || undefined,
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Next Class Banner */}
      {nextClass && (
        <div className="p-4 rounded-3xl bg-blue-600 text-white shadow-md shadow-blue-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-blue-100 uppercase tracking-wider block">
                Próxima clase
              </span>
              <h4 className="text-base font-extrabold truncate">
                {nextClass.course.name} · {nextClass.dayName} {nextClass.timeStr}
              </h4>
            </div>
          </div>
          <button
            onClick={() =>
              navigateTo({ type: 'course-detail', courseId: nextClass.course.id })
            }
            className="px-3 py-1.5 rounded-xl bg-white text-blue-600 text-xs font-bold shrink-0 hover:bg-blue-50 transition-colors"
          >
            Ver curso
          </button>
        </div>
      )}

      {/* Week Navigator */}
      <div className="flex items-center justify-between p-3 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs">
        <button
          onClick={() => setWeekOffset((prev) => prev - 1)}
          className="w-9 h-9 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Semana anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-xs font-extrabold text-slate-900 dark:text-white capitalize">
          {weekInfo.label}
        </span>

        <button
          onClick={() => setWeekOffset((prev) => prev + 1)}
          className="w-9 h-9 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Semana siguiente"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Schedule Conflicts Alert Banner */}
      {conflicts.length > 0 && (
        <div className="p-3.5 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block font-bold">¡Choque de horarios detectado!</strong>
            <p className="mt-0.5 text-[11px] leading-relaxed">
              {conflicts[0].courseA.name} ({conflicts[0].blockA.startTime}-{conflicts[0].blockA.endTime}) coincide el {DAY_NAMES_ES[conflicts[0].blockA.dayOfWeek - 1]} con {conflicts[0].courseB.name}.
            </p>
          </div>
        </div>
      )}

      {/* Days List (Lunes a Viernes / Domingo) matching Screen 6 */}
      <div className="flex flex-col gap-4">
        {[1, 2, 3, 4, 5].map((dayNum) => {
          const dayName = DAY_NAMES_ES[dayNum - 1];
          const items = blocksByDay[dayNum] || [];

          return (
            <div key={dayNum} className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {dayName}
                </h3>
                <button
                  onClick={() => handleOpenAdd(dayNum)}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir</span>
                </button>
              </div>

              {items.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {items.map(({ block, course }) => {
                    const colorScheme = COURSE_COLORS[course.color] || COURSE_COLORS.blue;

                    return (
                      <div
                        key={block.id}
                        className="group flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                      >
                        {/* Time & Course Badge */}
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 tabular-nums">
                            {block.startTime} - {block.endTime}
                          </span>

                          <div
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs text-white truncate shadow-xs ${colorScheme.bg}`}
                          >
                            {course.name}
                          </div>

                          {block.classroom && (
                            <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
                              <MapPin className="w-3 h-3" />
                              {block.classroom}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleOpenEdit(course.id, block)}
                            className="p-1.5 text-slate-400 hover:text-blue-500 rounded-lg"
                            title="Editar bloque"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm({ courseId: course.id, blockId: block.id })
                            }
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                            title="Eliminar bloque"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-3 px-4 rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                  <span>Sin clases programadas este día</span>
                  <button
                    onClick={() => handleOpenAdd(dayNum)}
                    className="text-blue-600 dark:text-blue-400 font-semibold"
                  >
                    + Asignar
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Block Form Modal */}
      <BottomSheet
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBlock ? 'Editar horario' : 'Nuevo bloque de clase'}
        description="Asigna el día y horas de clase"
      >
        <form onSubmit={handleSaveBlock} className="flex flex-col gap-4 pb-4">
          {/* Course select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Curso asignado
            </label>
            <select
              value={formCourseId}
              onChange={(e) => setFormCourseId(e.target.value)}
              className="w-full h-11 px-3 text-xs font-semibold rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.level})
                </option>
              ))}
            </select>
          </div>

          {/* Day of Week */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Día de la semana
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFormDay(d)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    formDay === d
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {DAY_NAMES_ES[d - 1].slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Hora inicio"
              type="time"
              value={formStart}
              onChange={(e) => setFormStart(e.target.value)}
              required
            />
            <Input
              label="Hora fin"
              type="time"
              value={formEnd}
              onChange={(e) => setFormEnd(e.target.value)}
              required
            />
          </div>

          {/* Classroom */}
          <Input
            label="Aula o lugar (opcional)"
            placeholder="ej. Aula 204 / Laboratorio 1"
            value={formClassroom}
            onChange={(e) => setFormClassroom(e.target.value)}
          />

          <div className="flex items-center gap-2 mt-2">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" fullWidth>
              Guardar bloque
            </Button>
          </div>
        </form>
      </BottomSheet>

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            deleteScheduleBlock(deleteConfirm.courseId, deleteConfirm.blockId);
            setDeleteConfirm(null);
          }
        }}
        title="¿Eliminar bloque de horario?"
        message="Esta clase se removerá del horario semanal del curso."
        confirmText="Eliminar"
        isDestructive
      />
    </div>
  );
};
