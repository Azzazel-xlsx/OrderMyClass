import React, { useState, useMemo } from 'react';
import { Search, Plus, BookOpen, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CourseCard } from '../components/courses/CourseCard';
import { CourseFormModal } from '../components/courses/CourseFormModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Button } from '../components/common/Button';
import { Course, CourseColor } from '../types';

export const CoursesView: React.FC = () => {
  const { courses, addCourse, updateCourse, deleteCourse, resetToDemoData } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  // Filter courses by search query
  const filteredCourses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return courses;
    return courses.filter(
      (c) => c.name.toLowerCase().includes(q) || c.level.toLowerCase().includes(q)
    );
  }, [courses, searchQuery]);

  const handleOpenCreate = () => {
    setEditingCourse(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handleSubmitCourse = (data: {
    name: string;
    level: string;
    color: CourseColor;
    gradeScale: '10' | '100';
  }) => {
    if (editingCourse) {
      updateCourse(editingCourse.id, data);
    } else {
      addCourse({
        name: data.name,
        level: data.level,
        color: data.color,
        gradeScale: data.gradeScale,
        skillWeights: { listening: 30, reading: 35, speaking: 35 },
        subGradeConfigs: {
          listening: [
            { id: 'sub-l1', name: 'Quiz 1', weightPercent: 50 },
            { id: 'sub-l2', name: 'Test Final', weightPercent: 50 },
          ],
          reading: [
            { id: 'sub-r1', name: 'Lectura 1', weightPercent: 50 },
            { id: 'sub-r2', name: 'Vocabulario', weightPercent: 50 },
          ],
          speaking: [
            { id: 'sub-s1', name: 'Conversación', weightPercent: 50 },
            { id: 'sub-s2', name: 'Presentación', weightPercent: 50 },
          ],
        },
        schedule: [],
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Search & Actions Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por curso o nivel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 text-xs font-medium rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>

        <button
          onClick={handleOpenCreate}
          className="h-11 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nuevo</span>
        </button>
      </div>

      {/* Courses List */}
      {filteredCourses.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={handleOpenEdit}
              onDelete={setCourseToDelete}
            />
          ))}

          {/* Dotted "Crear curso" card matching reference UI */}
          <button
            onClick={handleOpenCreate}
            className="w-full py-6 px-4 rounded-3xl border-2 border-dashed border-blue-300 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 hover:bg-blue-50/70 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-[0.99] cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-300 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Crear curso
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Configura un nuevo curso
            </span>
          </button>
        </div>
      ) : searchQuery ? (
        /* Empty search state */
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-2">
          <AlertCircle className="w-8 h-8 text-slate-400" />
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            No se encontraron cursos
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No hay resultados para "{searchQuery}". Prueba con otro término.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSearchQuery('')}
            className="mt-2"
          >
            Limpiar búsqueda
          </Button>
        </div>
      ) : (
        /* Zero courses empty state */
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              No tienes cursos todavía
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              Empieza creando tu primer curso de inglés o restaura los datos de prueba iniciales.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs mt-2">
            <Button variant="primary" fullWidth onClick={handleOpenCreate}>
              <Plus className="w-4 h-4 mr-1" />
              Crear curso
            </Button>
            <Button variant="secondary" fullWidth onClick={resetToDemoData}>
              Cargar demo
            </Button>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <CourseFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitCourse}
        initialData={editingCourse}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(courseToDelete)}
        onClose={() => setCourseToDelete(null)}
        onConfirm={() => {
          if (courseToDelete) {
            deleteCourse(courseToDelete.id);
            setCourseToDelete(null);
          }
        }}
        title="¿Eliminar curso?"
        message={`Se eliminará "${courseToDelete?.name}" junto con sus estudiantes, notas y registros de asistencia. Podrás deshacer la acción desde la notificación.`}
        confirmText="Eliminar curso"
        isDestructive
      />
    </div>
  );
};
