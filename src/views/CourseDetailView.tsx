import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  FileSpreadsheet,
  Upload,
  Sliders,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Trash2,
  Edit2,
  ArrowUpDown,
  BookOpen,
  UserCheck,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Course, Student, SkillType } from '../types';
import { COURSE_COLORS } from '../utils/themeColors';
import {
  calculateSkillScore,
  calculateFinalGrade,
  calculateStudentAttendance,
  calculateCourseAverage,
  calculateCourseAttendanceRate,
} from '../utils/gradeCalculations';
import { Button } from '../components/common/Button';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { StudentFormModal } from '../components/students/StudentFormModal';
import { GradeEditorSheet } from '../components/grades/GradeEditorSheet';

interface CourseDetailViewProps {
  courseId: string;
  initialSubTab?: 'students' | 'grades' | 'details';
}

export const CourseDetailView: React.FC<CourseDetailViewProps> = ({
  courseId,
  initialSubTab = 'students',
}) => {
  const {
    courses,
    students,
    deleteStudent,
    deleteStudentsBatch,
    addStudent,
    updateStudent,
    navigateTo,
    navigateBack,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'students' | 'grades' | 'details'>(initialSubTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'grade' | 'attendance'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Modals state
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [batchDeleteConfirmOpen, setBatchDeleteConfirmOpen] = useState(false);

  // Grade editor bottom sheet state
  const [gradeSheetData, setGradeSheetData] = useState<{
    student: Student;
    skill: SkillType;
    subGradeId: string;
    subGradeName: string;
  } | null>(null);

  const course = courses.find((c) => c.id === courseId);
  const courseStudents = useMemo(
    () => students.filter((s) => s.courseId === courseId),
    [students, courseId]
  );

  const colorScheme = course ? COURSE_COLORS[course.color] : COURSE_COLORS.blue;
  const courseAvg = course ? calculateCourseAverage(students, course) : null;
  const courseAttendance = course ? calculateCourseAttendanceRate(students, course.id) : 100;

  // Filtered and sorted students
  const processedStudents = useMemo(() => {
    let result = [...courseStudents];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.email && s.email.toLowerCase().includes(q))
      );
    }

    if (!course) return result;

    result.sort((a, b) => {
      if (sortBy === 'name') {
        const cmp = a.name.localeCompare(b.name, 'es');
        return sortOrder === 'asc' ? cmp : -cmp;
      }
      if (sortBy === 'grade') {
        const gradeA = calculateFinalGrade(a, course) ?? -1;
        const gradeB = calculateFinalGrade(b, course) ?? -1;
        return sortOrder === 'asc' ? gradeA - gradeB : gradeB - gradeA;
      }
      if (sortBy === 'attendance') {
        const attA = calculateStudentAttendance(a).percentage;
        const attB = calculateStudentAttendance(b).percentage;
        return sortOrder === 'asc' ? attA - attB : attB - attA;
      }
      return 0;
    });

    return result;
  }, [courseStudents, searchQuery, sortBy, sortOrder, course]);

  if (!course) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
        <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-800 dark:text-white">
          Curso no encontrado
        </h3>
        <p className="text-xs text-slate-500 mt-1">Este curso pudo haber sido eliminado.</p>
        <Button variant="secondary" size="sm" onClick={navigateBack} className="mt-4">
          Volver a Cursos
        </Button>
      </div>
    );
  }

  // Toggle student selection
  const handleToggleSelect = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === processedStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(processedStudents.map((s) => s.id));
    }
  };

  return (
    <div className="flex flex-col gap-3.5 pb-24">
      {/* Course Banner matching the reference app */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm ${colorScheme.bg}`}
            >
              {course.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                {course.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {courseStudents.length} estudiantes · {course.level}
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              navigateTo({ type: 'course-grades-config', courseId: course.id })
            }
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            title="Configurar porcentajes de notas"
            aria-label="Configurar notas"
          >
            <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </button>
        </div>

        {/* Sub-tab Navigation (Estudiantes · Notas · Detalles) */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl mt-4">
          <button
            onClick={() => setActiveTab('students')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'students'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Estudiantes ({courseStudents.length})
          </button>
          <button
            onClick={() => setActiveTab('grades')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'grades'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Notas
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'details'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Detalles
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: ESTUDIANTES */}
      {activeTab === 'students' && (
        <div className="flex flex-col gap-3">
          {/* Action bar & Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar estudiante..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 text-xs font-medium rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
              />
            </div>

            <button
              onClick={() => {
                setEditingStudent(null);
                setStudentModalOpen(true);
              }}
              className="h-11 px-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1 shadow-sm shrink-0"
              title="Agregar estudiante individual"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo</span>
            </button>

            <button
              onClick={() =>
                navigateTo({ type: 'mass-import', courseId: course.id })
              }
              className="h-11 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1 shadow-sm shrink-0"
              title="Carga masiva con bloc de notas"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Masiva</span>
            </button>
          </div>

          {/* Quick Sorting & Batch Selection controls */}
          <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (sortBy === 'name') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy('name');
                    setSortOrder('asc');
                  }
                }}
                className={`flex items-center gap-1 font-semibold ${
                  sortBy === 'name' ? 'text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                <span>Nombre</span>
                <ArrowUpDown className="w-3 h-3" />
              </button>
              <span>·</span>
              <button
                onClick={() => {
                  if (sortBy === 'grade') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy('grade');
                    setSortOrder('desc');
                  }
                }}
                className={`flex items-center gap-1 font-semibold ${
                  sortBy === 'grade' ? 'text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                <span>Nota</span>
                <ArrowUpDown className="w-3 h-3" />
              </button>
              <span>·</span>
              <button
                onClick={() => {
                  if (sortBy === 'attendance') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy('attendance');
                    setSortOrder('desc');
                  }
                }}
                className={`flex items-center gap-1 font-semibold ${
                  sortBy === 'attendance' ? 'text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                <span>Asistencia</span>
                <ArrowUpDown className="w-3 h-3" />
              </button>
            </div>

            <button
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                setSelectedStudentIds([]);
              }}
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {isSelectionMode ? 'Cancelar selección' : 'Selección múltiple'}
            </button>
          </div>

          {/* Batch action banner if in selection mode */}
          {isSelectionMode && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={
                    processedStudents.length > 0 &&
                    selectedStudentIds.length === processedStudents.length
                  }
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedStudentIds.length} seleccionados
                </span>
              </div>
              <Button
                variant="danger"
                size="sm"
                disabled={selectedStudentIds.length === 0}
                onClick={() => setBatchDeleteConfirmOpen(true)}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Eliminar
              </Button>
            </div>
          )}

          {/* Table Header: Listening, Reading, Speaking, Final, Asist. (as in screenshot 3) */}
          <div className="flex items-center justify-between px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <span className="w-28 sm:w-36 truncate">Estudiante</span>
            <div className="flex items-center gap-2 sm:gap-3 text-right pr-1">
              <span className="w-6 sm:w-7 text-center">List.</span>
              <span className="w-6 sm:w-7 text-center">Read.</span>
              <span className="w-6 sm:w-7 text-center">Spk.</span>
              <span className="w-8 text-center">Final</span>
              <span className="w-5 sm:w-6 text-center">Asist.</span>
            </div>
          </div>

          {/* Student rows list */}
          {processedStudents.length > 0 ? (
            <div className="flex flex-col gap-2">
              {processedStudents.map((student) => {
                const listening = calculateSkillScore(student, course, 'listening');
                const reading = calculateSkillScore(student, course, 'reading');
                const speaking = calculateSkillScore(student, course, 'speaking');
                const finalGrade = calculateFinalGrade(student, course);
                const attStats = calculateStudentAttendance(student);

                // Most recent attendance status
                const dates = Object.keys(student.attendance || {}).sort();
                const latestDate = dates[dates.length - 1];
                const latestStatus = latestDate ? student.attendance[latestDate] : null;

                const isSelected = selectedStudentIds.includes(student.id);

                return (
                  <div
                    key={student.id}
                    onClick={() => {
                      if (isSelectionMode) {
                        handleToggleSelect(student.id);
                      } else {
                        navigateTo({
                          type: 'student-profile',
                          studentId: student.id,
                          courseId: course.id,
                        });
                      }
                    }}
                    className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-150 cursor-pointer active:scale-[0.99] ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30'
                        : 'border-slate-100 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {/* Left: Avatar + Name */}
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 pr-1">
                      {isSelectionMode ? (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(student.id)}
                          className="w-4 h-4 rounded text-blue-600 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
                          {student.name
                            .split(' ')
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate block max-w-[100px] sm:max-w-[150px]">
                          {student.name}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block">
                          {attStats.percentage}% ({attStats.presentCount}/{attStats.totalSessions})
                        </span>
                      </div>
                    </div>

                    {/* Right: Skill Scores + Final Badge + Att icon */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <span className="w-6 sm:w-7 text-center text-xs font-medium text-slate-600 dark:text-slate-300 tabular-nums">
                        {listening !== null ? listening.toFixed(1) : '-'}
                      </span>
                      <span className="w-6 sm:w-7 text-center text-xs font-medium text-slate-600 dark:text-slate-300 tabular-nums">
                        {reading !== null ? reading.toFixed(1) : '-'}
                      </span>
                      <span className="w-6 sm:w-7 text-center text-xs font-medium text-slate-600 dark:text-slate-300 tabular-nums">
                        {speaking !== null ? speaking.toFixed(1) : '-'}
                      </span>

                      {/* Final grade badge */}
                      <span
                        className={`w-8 sm:w-9 py-1 rounded-xl text-xs font-bold text-center text-white tabular-nums ${
                          finalGrade !== null && finalGrade >= 8.5
                            ? 'bg-blue-600'
                            : finalGrade !== null && finalGrade >= 7.0
                            ? 'bg-purple-600'
                            : finalGrade !== null && finalGrade >= 6.0
                            ? 'bg-amber-600'
                            : finalGrade !== null
                            ? 'bg-rose-600'
                            : 'bg-slate-400'
                        }`}
                      >
                        {finalGrade !== null ? finalGrade.toFixed(1) : '-'}
                      </span>

                      {/* Attendance indicator */}
                      <div className="w-5 sm:w-6 flex justify-center">
                        {latestStatus === 'present' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                        ) : latestStatus === 'absent' ? (
                          <XCircle className="w-4 h-4 text-rose-500 fill-rose-100 dark:fill-rose-950" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-3">
              <p className="text-xs text-slate-500">
                {searchQuery
                  ? `No hay estudiantes que coincidan con "${searchQuery}".`
                  : 'Aún no hay estudiantes registrados en este curso.'}
              </p>
              {!searchQuery && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setEditingStudent(null);
                      setStudentModalOpen(true);
                    }}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Agregar uno
                  </Button>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() =>
                      navigateTo({ type: 'mass-import', courseId: course.id })
                    }
                  >
                    <Upload className="w-3.5 h-3.5 mr-1" />
                    Carga masiva
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: NOTAS MATRIX */}
      {activeTab === 'grades' && (
        <div className="flex flex-col gap-3">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Planilla de notas de {course.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Toca cualquier casilla para calificar con el teclado numérico.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigateTo({ type: 'course-grades-config', courseId: course.id })
              }
            >
              <Sliders className="w-3.5 h-3.5 mr-1" />
              Ponderaciones
            </Button>
          </div>

          {/* Interactive Grade Matrix table */}
          <div className="overflow-x-auto rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="py-3 px-3 min-w-[120px] sticky left-0 bg-slate-50 dark:bg-slate-800 z-10">
                    Estudiante
                  </th>
                  {/* Listening subgrades */}
                  {course.subGradeConfigs.listening.map((sc) => (
                    <th key={sc.id} className="py-3 px-2 text-center min-w-[64px]">
                      <span className="text-blue-600 dark:text-blue-400 block truncate max-w-[64px]">
                        {sc.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        L · {sc.weightPercent}%
                      </span>
                    </th>
                  ))}
                  {/* Reading subgrades */}
                  {course.subGradeConfigs.reading.map((sc) => (
                    <th key={sc.id} className="py-3 px-2 text-center min-w-[64px]">
                      <span className="text-emerald-600 dark:text-emerald-400 block truncate max-w-[64px]">
                        {sc.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        R · {sc.weightPercent}%
                      </span>
                    </th>
                  ))}
                  {/* Speaking subgrades */}
                  {course.subGradeConfigs.speaking.map((sc) => (
                    <th key={sc.id} className="py-3 px-2 text-center min-w-[64px]">
                      <span className="text-purple-600 dark:text-purple-400 block truncate max-w-[64px]">
                        {sc.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        S · {sc.weightPercent}%
                      </span>
                    </th>
                  ))}
                  <th className="py-3 px-3 text-center min-w-[70px] bg-slate-100/50 dark:bg-slate-800/90 font-extrabold text-slate-900 dark:text-white">
                    Final
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {courseStudents.map((st) => {
                  const final = calculateFinalGrade(st, course);
                  return (
                    <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-slate-900 truncate max-w-[130px] z-10">
                        {st.name}
                      </td>

                      {/* Listening cells */}
                      {course.subGradeConfigs.listening.map((sc) => {
                        const val = st.grades.listening?.[sc.id];
                        return (
                          <td key={sc.id} className="p-1 text-center">
                            <button
                              onClick={() =>
                                setGradeSheetData({
                                  student: st,
                                  skill: 'listening',
                                  subGradeId: sc.id,
                                  subGradeName: sc.name,
                                })
                              }
                              className="w-12 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 border border-slate-200 dark:border-slate-700 text-xs font-semibold tabular-nums cursor-pointer transition-colors"
                            >
                              {val !== null && val !== undefined ? val : '-'}
                            </button>
                          </td>
                        );
                      })}

                      {/* Reading cells */}
                      {course.subGradeConfigs.reading.map((sc) => {
                        const val = st.grades.reading?.[sc.id];
                        return (
                          <td key={sc.id} className="p-1 text-center">
                            <button
                              onClick={() =>
                                setGradeSheetData({
                                  student: st,
                                  skill: 'reading',
                                  subGradeId: sc.id,
                                  subGradeName: sc.name,
                                })
                              }
                              className="w-12 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-600 border border-slate-200 dark:border-slate-700 text-xs font-semibold tabular-nums cursor-pointer transition-colors"
                            >
                              {val !== null && val !== undefined ? val : '-'}
                            </button>
                          </td>
                        );
                      })}

                      {/* Speaking cells */}
                      {course.subGradeConfigs.speaking.map((sc) => {
                        const val = st.grades.speaking?.[sc.id];
                        return (
                          <td key={sc.id} className="p-1 text-center">
                            <button
                              onClick={() =>
                                setGradeSheetData({
                                  student: st,
                                  skill: 'speaking',
                                  subGradeId: sc.id,
                                  subGradeName: sc.name,
                                })
                              }
                              className="w-12 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/60 hover:text-purple-600 border border-slate-200 dark:border-slate-700 text-xs font-semibold tabular-nums cursor-pointer transition-colors"
                            >
                              {val !== null && val !== undefined ? val : '-'}
                            </button>
                          </td>
                        );
                      })}

                      {/* Final grade badge */}
                      <td className="py-2.5 px-3 text-center bg-slate-50/50 dark:bg-slate-800/40">
                        <span className="font-extrabold text-xs text-blue-600 dark:text-blue-400 tabular-nums">
                          {final !== null ? final.toFixed(1) : '-'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DETALLES */}
      {activeTab === 'details' && (
        <div className="flex flex-col gap-3">
          {/* Summary stats card */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 block">Promedio del curso</span>
              <strong className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                {courseAvg !== null ? courseAvg.toFixed(1) : '-'}
              </strong>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Escala: 0 a {course.gradeScale || '10'}
              </span>
            </div>

            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 block">Asistencia promedio</span>
              <strong className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                {courseAttendance}%
              </strong>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Calculada en tiempo real
              </span>
            </div>
          </div>

          {/* Schedule list */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Horarios de clase</span>
              </h4>
              <button
                onClick={() => navigateTo({ type: 'tab', tab: 'schedule' })}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400"
              >
                Ver en semana →
              </button>
            </div>

            {course.schedule && course.schedule.length > 0 ? (
              <div className="flex flex-col gap-2 mt-2">
                {course.schedule.map((block) => {
                  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
                  return (
                    <div
                      key={block.id}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {days[block.dayOfWeek - 1]}
                      </span>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <span>
                          {block.startTime} - {block.endTime}
                        </span>
                        {block.classroom && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-[10px] text-slate-700 dark:text-slate-300">
                            {block.classroom}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-2">
                No hay bloques de horario asignados aún.
              </p>
            )}
          </div>

          {/* Quick buttons: Take attendance & Edit weights */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                const todayStr = new Date().toISOString().split('T')[0];
                navigateTo({
                  type: 'attendance-sheet',
                  courseId: course.id,
                  date: todayStr,
                });
              }}
            >
              <UserCheck className="w-4 h-4 mr-1.5" />
              Tomar asistencia de hoy
            </Button>

            <Button
              variant="secondary"
              fullWidth
              onClick={() =>
                navigateTo({ type: 'course-grades-config', courseId: course.id })
              }
            >
              <Sliders className="w-4 h-4 mr-1.5" />
              Configurar porcentajes de evaluación
            </Button>
          </div>
        </div>
      )}

      {/* Student Form Modal */}
      <StudentFormModal
        isOpen={studentModalOpen}
        onClose={() => {
          setStudentModalOpen(false);
          setEditingStudent(null);
        }}
        onSubmit={(data) => {
          if (editingStudent) {
            updateStudent(editingStudent.id, data);
          } else {
            addStudent({
              courseId: course.id,
              name: data.name,
              email: data.email,
              notes: data.notes,
            });
          }
        }}
        initialData={editingStudent}
      />

      {/* Batch Delete Confirmation */}
      <ConfirmModal
        isOpen={batchDeleteConfirmOpen}
        onClose={() => setBatchDeleteConfirmOpen(false)}
        onConfirm={() => {
          deleteStudentsBatch(selectedStudentIds);
          setSelectedStudentIds([]);
          setIsSelectionMode(false);
        }}
        title="¿Eliminar estudiantes seleccionados?"
        message={`Se eliminarán ${selectedStudentIds.length} estudiantes del curso. Podrás deshacer la acción desde la notificación.`}
        confirmText="Eliminar seleccionados"
        isDestructive
      />

      {/* Grade keypad bottom sheet */}
      {gradeSheetData && (
        <GradeEditorSheet
          isOpen={Boolean(gradeSheetData)}
          onClose={() => setGradeSheetData(null)}
          student={gradeSheetData.student}
          course={course}
          skill={gradeSheetData.skill}
          subGradeId={gradeSheetData.subGradeId}
          subGradeName={gradeSheetData.subGradeName}
        />
      )}
    </div>
  );
};
