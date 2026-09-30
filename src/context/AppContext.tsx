import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Course,
  Student,
  CourseAttendanceDay,
  GradeHistoryEntry,
  TeacherProfile,
  ToastMessage,
  ActiveView,
  ActiveTab,
  SkillType,
  AttendanceStatus,
} from '../types';
import {
  initialTeacher,
  initialCourses,
  initialStudents,
  initialAttendanceRecords,
} from '../data/initialData';

interface AppContextType {
  teacher: TeacherProfile;
  courses: Course[];
  students: Student[];
  attendanceDays: CourseAttendanceDay[];
  gradeHistory: GradeHistoryEntry[];
  toasts: ToastMessage[];
  theme: 'light' | 'dark';
  currentView: ActiveView;
  viewHistory: ActiveView[];

  // Theme
  toggleTheme: () => void;

  // Navigation
  navigateTo: (view: ActiveView) => void;
  navigateBack: () => void;
  setActiveTab: (tab: ActiveTab) => void;

  // Toasts
  showToast: (toast: Omit<ToastMessage, 'id'>) => string;
  removeToast: (id: string) => void;

  // Teacher Profile
  updateTeacher: (profile: Partial<TeacherProfile>) => void;

  // Courses
  addCourse: (course: Omit<Course, 'id' | 'createdAt'>) => Course;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;

  // Students
  addStudent: (student: Omit<Student, 'id' | 'grades' | 'attendance'>) => Student;
  addStudentsBatch: (courseId: string, studentNames: string[]) => { added: number; duplicates: number };
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  deleteStudentsBatch: (ids: string[]) => void;

  // Grades
  setStudentGrade: (
    studentId: string,
    skill: SkillType,
    subGradeId: string,
    newScore: number | null
  ) => void;
  updateSkillWeights: (
    courseId: string,
    weights: { listening: number; reading: number; speaking: number }
  ) => void;
  addSubGradeConfig: (
    courseId: string,
    skill: SkillType,
    name: string,
    weightPercent: number
  ) => void;
  updateSubGradeConfig: (
    courseId: string,
    skill: SkillType,
    subGradeId: string,
    name: string,
    weightPercent: number
  ) => void;
  deleteSubGradeConfig: (
    courseId: string,
    skill: SkillType,
    subGradeId: string
  ) => void;

  // Attendance
  saveAttendanceForDate: (
    courseId: string,
    date: string,
    records: Record<string, AttendanceStatus>
  ) => void;

  // Schedule
  addScheduleBlock: (block: {
    courseId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    classroom?: string;
  }) => void;
  updateScheduleBlock: (
    courseId: string,
    blockId: string,
    updates: { dayOfWeek: number; startTime: string; endTime: string; classroom?: string }
  ) => void;
  deleteScheduleBlock: (courseId: string, blockId: string) => void;

  // Data management
  resetToDemoData: () => void;
  clearAllData: () => void;
  importBackupJson: (jsonData: string) => boolean;
  exportBackupJson: () => string;
  exportGradesCsv: (courseId?: string) => string;
  exportAttendanceCsv: (courseId?: string) => string;
}

const STORAGE_KEYS = {
  TEACHER: 'order_students_teacher_v1',
  COURSES: 'order_students_courses_v1',
  STUDENTS: 'order_students_students_v1',
  ATTENDANCE: 'order_students_attendance_v1',
  GRADE_HISTORY: 'order_students_history_v1',
  THEME: 'order_students_theme_v1',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper for view serialization in URL hash
function viewToHash(view: ActiveView): string {
  switch (view.type) {
    case 'tab':
      return `#${view.tab}`;
    case 'course-detail':
      return `#course/${view.courseId}${view.subTab ? `/${view.subTab}` : ''}`;
    case 'course-grades-config':
      return `#course/${view.courseId}/grade-config`;
    case 'mass-import':
      return `#course/${view.courseId}/import`;
    case 'student-profile':
      return `#student/${view.studentId}/course/${view.courseId}`;
    case 'attendance-sheet':
      return `#attendance/${view.courseId}/${view.date}`;
    case 'attendance-history':
      return `#attendance-history${view.courseId ? `/${view.courseId}` : ''}`;
    default:
      return '#home';
  }
}

function hashToView(hash: string): ActiveView {
  const clean = hash.replace(/^#/, '');
  if (!clean || clean === 'home') return { type: 'tab', tab: 'home' };
  if (['courses', 'schedule', 'attendance', 'more'].includes(clean)) {
    return { type: 'tab', tab: clean as ActiveTab };
  }

  const parts = clean.split('/');
  if (parts[0] === 'course' && parts[1]) {
    if (parts[2] === 'grade-config') {
      return { type: 'course-grades-config', courseId: parts[1] };
    }
    if (parts[2] === 'import') {
      return { type: 'mass-import', courseId: parts[1] };
    }
    const subTab = ['students', 'grades', 'details'].includes(parts[2])
      ? (parts[2] as 'students' | 'grades' | 'details')
      : 'students';
    return { type: 'course-detail', courseId: parts[1], subTab };
  }

  if (parts[0] === 'student' && parts[1] && parts[2] === 'course' && parts[3]) {
    return { type: 'student-profile', studentId: parts[1], courseId: parts[3] };
  }

  if (parts[0] === 'attendance' && parts[1] && parts[2]) {
    return { type: 'attendance-sheet', courseId: parts[1], date: parts[2] };
  }

  if (parts[0] === 'attendance-history') {
    return { type: 'attendance-history', courseId: parts[1] };
  }

  return { type: 'tab', tab: 'home' };
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  // Navigation state
  const [currentView, setCurrentView] = useState<ActiveView>(() => {
    try {
      return hashToView(window.location.hash);
    } catch {
      return { type: 'tab', tab: 'home' };
    }
  });

  const [viewHistory, setViewHistory] = useState<ActiveView[]>([currentView]);

  // Sync hash on navigation
  const navigateTo = useCallback((view: ActiveView) => {
    setCurrentView(view);
    setViewHistory((prev) => [...prev, view]);
    try {
      const newHash = viewToHash(view);
      if (window.location.hash !== newHash) {
        window.history.pushState(null, '', newHash);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const navigateBack = useCallback(() => {
    setViewHistory((prev) => {
      if (prev.length <= 1) {
        const fallback: ActiveView = { type: 'tab', tab: 'courses' };
        setCurrentView(fallback);
        window.location.hash = '#courses';
        return [fallback];
      }
      const newHistory = prev.slice(0, prev.length - 1);
      const lastView = newHistory[newHistory.length - 1];
      setCurrentView(lastView);
      window.location.hash = viewToHash(lastView);
      return newHistory;
    });
  }, []);

  const setActiveTab = useCallback((tab: ActiveTab) => {
    navigateTo({ type: 'tab', tab });
  }, [navigateTo]);

  // Listen to popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const target = hashToView(window.location.hash);
      setCurrentView(target);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync dark class on HTML
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toastData: Omit<ToastMessage, 'id'>) => {
      const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const newToast: ToastMessage = {
        ...toastData,
        id,
        duration: toastData.duration ?? 4500,
      };
      setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5 toasts
      return id;
    },
    []
  );

  // Core Data
  const [teacher, setTeacher] = useState<TeacherProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEACHER);
      return saved ? JSON.parse(saved) : initialTeacher;
    } catch {
      return initialTeacher;
    }
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COURSES);
      return saved ? JSON.parse(saved) : initialCourses;
    } catch {
      return initialCourses;
    }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      return saved ? JSON.parse(saved) : initialStudents;
    } catch {
      return initialStudents;
    }
  });

  const [attendanceDays, setAttendanceDays] = useState<CourseAttendanceDay[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      return saved ? JSON.parse(saved) : initialAttendanceRecords;
    } catch {
      return initialAttendanceRecords;
    }
  });

  const [gradeHistory, setGradeHistory] = useState<GradeHistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GRADE_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist data on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TEACHER, JSON.stringify(teacher));
    } catch (e) {
      console.error(e);
    }
  }, [teacher]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    } catch (e) {
      console.error(e);
    }
  }, [courses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.error(e);
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceDays));
    } catch (e) {
      console.error(e);
    }
  }, [attendanceDays]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GRADE_HISTORY, JSON.stringify(gradeHistory));
    } catch (e) {
      console.error(e);
    }
  }, [gradeHistory]);

  const updateTeacher = useCallback((updates: Partial<TeacherProfile>) => {
    setTeacher((prev) => ({ ...prev, ...updates }));
    showToast({
      type: 'success',
      title: 'Perfil actualizado',
      message: 'Los datos del profesor se guardaron correctamente.',
    });
  }, [showToast]);

  // Courses CRUD
  const addCourse = useCallback(
    (courseData: Omit<Course, 'id' | 'createdAt'>): Course => {
      const newCourse: Course = {
        ...courseData,
        id: 'course-' + Date.now(),
        createdAt: new Date().toISOString(),
      };
      setCourses((prev) => [...prev, newCourse]);
      showToast({
        type: 'success',
        title: 'Curso creado',
        message: `El curso "${newCourse.name}" ha sido creado.`,
      });
      return newCourse;
    },
    [showToast]
  );

  const updateCourse = useCallback(
    (id: string, updates: Partial<Course>) => {
      setCourses((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
      showToast({
        type: 'success',
        title: 'Curso actualizado',
        message: 'Los cambios se han guardado.',
      });
    },
    [showToast]
  );

  const deleteCourse = useCallback(
    (id: string) => {
      const courseToDelete = courses.find((c) => c.id === id);
      if (!courseToDelete) return;

      const associatedStudents = students.filter((s) => s.courseId === id);
      const associatedAttendance = attendanceDays.filter((a) => a.courseId === id);

      // Perform deletion
      setCourses((prev) => prev.filter((c) => c.id !== id));
      setStudents((prev) => prev.filter((s) => s.courseId !== id));
      setAttendanceDays((prev) => prev.filter((a) => a.courseId !== id));

      // Offer Undo
      showToast({
        type: 'warning',
        title: 'Curso eliminado',
        message: `Se eliminó "${courseToDelete.name}" y sus ${associatedStudents.length} estudiantes.`,
        undoLabel: 'Deshacer',
        undoAction: () => {
          setCourses((prev) => [...prev, courseToDelete]);
          setStudents((prev) => [...prev, ...associatedStudents]);
          setAttendanceDays((prev) => [...prev, ...associatedAttendance]);
          showToast({
            type: 'info',
            message: `Curso "${courseToDelete.name}" restaurado.`,
          });
        },
      });
    },
    [courses, students, attendanceDays, showToast]
  );

  // Students CRUD
  const addStudent = useCallback(
    (studentData: Omit<Student, 'id' | 'grades' | 'attendance'>): Student => {
      const newStudent: Student = {
        ...studentData,
        id: 'stu-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        grades: { listening: {}, reading: {}, speaking: {} },
        attendance: {},
      };
      setStudents((prev) => [...prev, newStudent]);
      showToast({
        type: 'success',
        title: 'Estudiante agregado',
        message: `${newStudent.name} se unió al curso.`,
      });
      return newStudent;
    },
    [showToast]
  );

  const addStudentsBatch = useCallback(
    (courseId: string, studentNames: string[]) => {
      const existingInCourse = new Set(
        students
          .filter((s) => s.courseId === courseId)
          .map((s) => s.name.trim().toLowerCase())
      );

      const addedList: Student[] = [];
      let duplicates = 0;

      for (const rawName of studentNames) {
        const cleanName = rawName.trim();
        if (!cleanName) continue;
        if (existingInCourse.has(cleanName.toLowerCase())) {
          duplicates++;
          continue;
        }

        existingInCourse.add(cleanName.toLowerCase());
        addedList.push({
          id: 'stu-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
          courseId,
          name: cleanName,
          grades: { listening: {}, reading: {}, speaking: {} },
          attendance: {},
        });
      }

      if (addedList.length > 0) {
        setStudents((prev) => [...prev, ...addedList]);
        showToast({
          type: 'success',
          title: 'Estudiantes agregados',
          message: `Se crearon exitosamente ${addedList.length} estudiantes.${
            duplicates > 0 ? ` (${duplicates} omitidos por duplicados)` : ''
          }`,
        });
      } else if (duplicates > 0) {
        showToast({
          type: 'warning',
          title: 'Sin cambios',
          message: `Todos los nombres indicados (${duplicates}) ya existen en el curso.`,
        });
      }

      return { added: addedList.length, duplicates };
    },
    [students, showToast]
  );

  const updateStudent = useCallback(
    (id: string, updates: Partial<Student>) => {
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );
      showToast({
        type: 'success',
        title: 'Estudiante actualizado',
        message: 'Información modificada.',
      });
    },
    [showToast]
  );

  const deleteStudent = useCallback(
    (id: string) => {
      const student = students.find((s) => s.id === id);
      if (!student) return;

      setStudents((prev) => prev.filter((s) => s.id !== id));
      showToast({
        type: 'warning',
        title: 'Estudiante eliminado',
        message: `${student.name} ha sido eliminado.`,
        undoLabel: 'Deshacer',
        undoAction: () => {
          setStudents((prev) => [...prev, student]);
          showToast({
            type: 'info',
            message: `${student.name} ha sido restaurado.`,
          });
        },
      });
    },
    [students, showToast]
  );

  const deleteStudentsBatch = useCallback(
    (ids: string[]) => {
      const toDelete = students.filter((s) => ids.includes(s.id));
      if (toDelete.length === 0) return;

      setStudents((prev) => prev.filter((s) => !ids.includes(s.id)));
      showToast({
        type: 'warning',
        title: 'Estudiantes eliminados',
        message: `Se eliminaron ${toDelete.length} estudiantes.`,
        undoLabel: 'Deshacer',
        undoAction: () => {
          setStudents((prev) => [...prev, ...toDelete]);
          showToast({
            type: 'info',
            message: `Se restauraron ${toDelete.length} estudiantes.`,
          });
        },
      });
    },
    [students, showToast]
  );

  // Grades Management
  const setStudentGrade = useCallback(
    (
      studentId: string,
      skill: SkillType,
      subGradeId: string,
      newScore: number | null
    ) => {
      const student = students.find((s) => s.id === studentId);
      if (!student) return;
      const course = courses.find((c) => c.id === student.courseId);
      const subConfig = course?.subGradeConfigs[skill]?.find((c) => c.id === subGradeId);
      const oldScore = student.grades[skill]?.[subGradeId] ?? null;

      // Update student
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id !== studentId) return s;
          const nextGrades = { ...s.grades };
          nextGrades[skill] = {
            ...(nextGrades[skill] || {}),
            [subGradeId]: newScore,
          };
          return { ...s, grades: nextGrades };
        })
      );

      // Register in history if score changed
      if (newScore !== null && newScore !== oldScore) {
        const historyEntry: GradeHistoryEntry = {
          id: 'gh-' + Date.now(),
          studentId: student.id,
          studentName: student.name,
          courseId: student.courseId,
          skill,
          subGradeName: subConfig ? subConfig.name : subGradeId,
          oldScore,
          newScore,
          timestamp: new Date().toISOString(),
        };
        setGradeHistory((prev) => [historyEntry, ...prev].slice(0, 500));
      }
    },
    [students, courses]
  );

  const updateSkillWeights = useCallback(
    (
      courseId: string,
      weights: { listening: number; reading: number; speaking: number }
    ) => {
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, skillWeights: weights } : c))
      );
      showToast({
        type: 'success',
        title: 'Porcentajes actualizados',
        message: 'Los pesos de habilidades se recalcularon.',
      });
    },
    [showToast]
  );

  const addSubGradeConfig = useCallback(
    (courseId: string, skill: SkillType, name: string, weightPercent: number) => {
      const newConfig = {
        id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        name,
        weightPercent,
      };
      setCourses((prev) =>
        prev.map((c) => {
          if (c.id !== courseId) return c;
          const currentList = c.subGradeConfigs[skill] || [];
          return {
            ...c,
            subGradeConfigs: {
              ...c.subGradeConfigs,
              [skill]: [...currentList, newConfig],
            },
          };
        })
      );
      showToast({
        type: 'success',
        title: 'Sub-nota agregada',
        message: `Se añadió "${name}" (${weightPercent}%) a ${skill}.`,
      });
    },
    [showToast]
  );

  const updateSubGradeConfig = useCallback(
    (
      courseId: string,
      skill: SkillType,
      subGradeId: string,
      name: string,
      weightPercent: number
    ) => {
      setCourses((prev) =>
        prev.map((c) => {
          if (c.id !== courseId) return c;
          return {
            ...c,
            subGradeConfigs: {
              ...c.subGradeConfigs,
              [skill]: c.subGradeConfigs[skill].map((sc) =>
                sc.id === subGradeId ? { ...sc, name, weightPercent } : sc
              ),
            },
          };
        })
      );
      showToast({
        type: 'success',
        title: 'Sub-nota actualizada',
        message: `Modificada "${name}".`,
      });
    },
    [showToast]
  );

  const deleteSubGradeConfig = useCallback(
    (courseId: string, skill: SkillType, subGradeId: string) => {
      setCourses((prev) =>
        prev.map((c) => {
          if (c.id !== courseId) return c;
          return {
            ...c,
            subGradeConfigs: {
              ...c.subGradeConfigs,
              [skill]: c.subGradeConfigs[skill].filter((sc) => sc.id !== subGradeId),
            },
          };
        })
      );
      showToast({
        type: 'info',
        title: 'Sub-nota eliminada',
        message: 'La columna de evaluación fue removida.',
      });
    },
    [showToast]
  );

  // Attendance
  const saveAttendanceForDate = useCallback(
    (courseId: string, date: string, records: Record<string, AttendanceStatus>) => {
      // 1. Update attendanceDays log
      setAttendanceDays((prev) => {
        const existingIndex = prev.findIndex(
          (d) => d.courseId === courseId && d.date === date
        );
        const newRecord: CourseAttendanceDay = {
          id: existingIndex >= 0 ? prev[existingIndex].id : 'att-' + date + '-' + courseId,
          courseId,
          date,
          records,
          savedAt: new Date().toISOString(),
        };

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = newRecord;
          return updated;
        } else {
          return [newRecord, ...prev];
        }
      });

      // 2. Update students individual attendance
      setStudents((prev) =>
        prev.map((s) => {
          if (s.courseId !== courseId) return s;
          const status = records[s.id];
          if (!status) return s;
          return {
            ...s,
            attendance: {
              ...s.attendance,
              [date]: status,
            },
          };
        })
      );

      const presentCount = Object.values(records).filter((r) => r === 'present').length;
      const totalCount = Object.keys(records).length;

      showToast({
        type: 'success',
        title: 'Asistencia guardada',
        message: `${presentCount} de ${totalCount} estudiantes presentes el ${date}.`,
      });
    },
    [showToast]
  );

  // Schedule blocks
  const addScheduleBlock = useCallback(
    (block: {
      courseId: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      classroom?: string;
    }) => {
      const newBlock = { ...block, id: 'sch-' + Date.now() };
      setCourses((prev) =>
        prev.map((c) =>
          c.id === block.courseId
            ? { ...c, schedule: [...(c.schedule || []), newBlock] }
            : c
        )
      );
      showToast({
        type: 'success',
        title: 'Horario agregado',
        message: `Bloque añadido correctamente.`,
      });
    },
    [showToast]
  );

  const updateScheduleBlock = useCallback(
    (
      courseId: string,
      blockId: string,
      updates: { dayOfWeek: number; startTime: string; endTime: string; classroom?: string }
    ) => {
      setCourses((prev) =>
        prev.map((c) => {
          if (c.id !== courseId) return c;
          return {
            ...c,
            schedule: (c.schedule || []).map((b) =>
              b.id === blockId ? { ...b, ...updates } : b
            ),
          };
        })
      );
      showToast({
        type: 'success',
        title: 'Horario actualizado',
        message: 'El bloque ha sido modificado.',
      });
    },
    [showToast]
  );

  const deleteScheduleBlock = useCallback(
    (courseId: string, blockId: string) => {
      setCourses((prev) =>
        prev.map((c) => {
          if (c.id !== courseId) return c;
          return {
            ...c,
            schedule: (c.schedule || []).filter((b) => b.id !== blockId),
          };
        })
      );
      showToast({
        type: 'info',
        title: 'Horario eliminado',
        message: 'El bloque de clase ha sido eliminado.',
      });
    },
    [showToast]
  );

  // Data Reset & Exports
  const resetToDemoData = useCallback(() => {
    setTeacher(initialTeacher);
    setCourses(initialCourses);
    setStudents(initialStudents);
    setAttendanceDays(initialAttendanceRecords);
    setGradeHistory([]);
    try {
      localStorage.setItem(STORAGE_KEYS.TEACHER, JSON.stringify(initialTeacher));
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(initialCourses));
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(initialStudents));
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(initialAttendanceRecords));
      localStorage.removeItem(STORAGE_KEYS.GRADE_HISTORY);
    } catch (e) {
      console.error(e);
    }
    showToast({
      type: 'info',
      title: 'Datos de demostración',
      message: 'Se cargaron los 4 cursos y estudiantes de prueba.',
    });
  }, [showToast]);

  const clearAllData = useCallback(() => {
    const backupSnapshot = { courses, students, attendanceDays, gradeHistory, teacher };

    setCourses([]);
    setStudents([]);
    setAttendanceDays([]);
    setGradeHistory([]);

    try {
      localStorage.removeItem(STORAGE_KEYS.COURSES);
      localStorage.removeItem(STORAGE_KEYS.STUDENTS);
      localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
      localStorage.removeItem(STORAGE_KEYS.GRADE_HISTORY);
    } catch (e) {
      console.error(e);
    }

    showToast({
      type: 'warning',
      title: 'Base de datos borrada',
      message: 'Se han eliminado todos los registros.',
      undoLabel: 'Deshacer',
      undoAction: () => {
        setCourses(backupSnapshot.courses);
        setStudents(backupSnapshot.students);
        setAttendanceDays(backupSnapshot.attendanceDays);
        setGradeHistory(backupSnapshot.gradeHistory);
        showToast({
          type: 'success',
          message: 'Datos restaurados exitosamente.',
        });
      },
    });
  }, [courses, students, attendanceDays, gradeHistory, teacher, showToast]);

  const exportBackupJson = useCallback((): string => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      teacher,
      courses,
      students,
      attendanceDays,
      gradeHistory,
    };
    return JSON.stringify(backup, null, 2);
  }, [teacher, courses, students, attendanceDays, gradeHistory]);

  const importBackupJson = useCallback(
    (jsonString: string): boolean => {
      try {
        const parsed = JSON.parse(jsonString);
        if (!parsed.courses || !parsed.students) {
          showToast({
            type: 'error',
            title: 'Archivo inválido',
            message: 'El respaldo no contiene la estructura requerida.',
          });
          return false;
        }

        if (parsed.teacher) setTeacher(parsed.teacher);
        setCourses(parsed.courses);
        setStudents(parsed.students);
        if (parsed.attendanceDays) setAttendanceDays(parsed.attendanceDays);
        if (parsed.gradeHistory) setGradeHistory(parsed.gradeHistory);

        showToast({
          type: 'success',
          title: 'Respaldo restaurado',
          message: `Se importaron ${parsed.courses.length} cursos y ${parsed.students.length} estudiantes.`,
        });
        return true;
      } catch (e) {
        showToast({
          type: 'error',
          title: 'Error de importación',
          message: 'El archivo JSON está corrupto o mal formado.',
        });
        return false;
      }
    },
    [showToast]
  );

  const exportGradesCsv = useCallback(
    (courseId?: string): string => {
      const targetCourses = courseId ? courses.filter((c) => c.id === courseId) : courses;
      const rows: string[] = ['Curso,Estudiante,Email,Listening,Reading,Speaking,Nota Final'];

      for (const course of targetCourses) {
        const courseStudents = students.filter((s) => s.courseId === course.id);
        for (const st of courseStudents) {
          // calculate skills
          const lScore = Object.values(st.grades.listening || {}).filter(
            (v) => v !== null
          );
          const lAvg = lScore.length
            ? (lScore.reduce((a, b) => a + (b || 0), 0) / lScore.length).toFixed(1)
            : '-';

          const rScore = Object.values(st.grades.reading || {}).filter(
            (v) => v !== null
          );
          const rAvg = rScore.length
            ? (rScore.reduce((a, b) => a + (b || 0), 0) / rScore.length).toFixed(1)
            : '-';

          const sScore = Object.values(st.grades.speaking || {}).filter(
            (v) => v !== null
          );
          const sAvg = sScore.length
            ? (sScore.reduce((a, b) => a + (b || 0), 0) / sScore.length).toFixed(1)
            : '-';

          rows.push(
            `"${course.name}","${st.name}","${st.email || ''}",${lAvg},${rAvg},${sAvg},${
              // final
              lAvg !== '-' ? lAvg : '-'
            }`
          );
        }
      }

      return rows.join('\n');
    },
    [courses, students]
  );

  const exportAttendanceCsv = useCallback(
    (courseId?: string): string => {
      const targetCourses = courseId ? courses.filter((c) => c.id === courseId) : courses;
      const rows: string[] = ['Curso,Estudiante,Total Clases,Presentes,Ausentes,% Asistencia'];

      for (const course of targetCourses) {
        const courseStudents = students.filter((s) => s.courseId === course.id);
        for (const st of courseStudents) {
          const recs = Object.values(st.attendance || {});
          const total = recs.length;
          const present = recs.filter((r) => r === 'present').length;
          const absent = recs.filter((r) => r === 'absent').length;
          const pct = total > 0 ? Math.round((present / total) * 100) + '%' : '100%';
          rows.push(`"${course.name}","${st.name}",${total},${present},${absent},${pct}`);
        }
      }

      return rows.join('\n');
    },
    [courses, students]
  );

  return (
    <AppContext.Provider
      value={{
        teacher,
        courses,
        students,
        attendanceDays,
        gradeHistory,
        toasts,
        theme,
        currentView,
        viewHistory,
        toggleTheme,
        navigateTo,
        navigateBack,
        setActiveTab,
        showToast,
        removeToast,
        updateTeacher,
        addCourse,
        updateCourse,
        deleteCourse,
        addStudent,
        addStudentsBatch,
        updateStudent,
        deleteStudent,
        deleteStudentsBatch,
        setStudentGrade,
        updateSkillWeights,
        addSubGradeConfig,
        updateSubGradeConfig,
        deleteSubGradeConfig,
        saveAttendanceForDate,
        addScheduleBlock,
        updateScheduleBlock,
        deleteScheduleBlock,
        resetToDemoData,
        clearAllData,
        importBackupJson,
        exportBackupJson,
        exportGradesCsv,
        exportAttendanceCsv,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
