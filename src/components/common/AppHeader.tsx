import React from 'react';
import { ChevronLeft, Bell, Sparkles, GraduationCap, Moon, Sun } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AppHeader: React.FC = () => {
  const { currentView, navigateBack, teacher, theme, toggleTheme, courses, navigateTo } = useApp();

  const isTabRoot = currentView.type === 'tab';

  // Get detail title if not in tab
  const getHeaderInfo = () => {
    switch (currentView.type) {
      case 'course-detail': {
        const course = courses.find((c) => c.id === currentView.courseId);
        return {
          title: course ? course.name : 'Curso',
          subtitle: course ? `${course.level}` : '',
        };
      }
      case 'course-grades-config':
        return { title: 'Sistema de notas', subtitle: 'Configuración de ponderaciones' };
      case 'mass-import':
        return { title: 'Carga masiva', subtitle: 'Importar lista de estudiantes' };
      case 'student-profile':
        return { title: 'Perfil de estudiante', subtitle: 'Notas y asistencia individual' };
      case 'attendance-sheet':
        return { title: 'Tomar asistencia', subtitle: currentView.date };
      case 'attendance-history':
        return { title: 'Calendario de asistencias', subtitle: 'Historial y registros' };
      case 'tab': {
        switch (currentView.tab) {
          case 'home':
            return { title: 'ClassTrack', subtitle: 'Tu clase, en orden' };
          case 'courses':
            return { title: 'Cursos', subtitle: `${courses.length} activos` };
          case 'schedule':
            return { title: 'Horario', subtitle: 'Vista semanal' };
          case 'attendance':
            return { title: 'Asistencias', subtitle: 'Control diario' };
          case 'more':
            return { title: 'Ajustes y Más', subtitle: 'Opciones y respaldos' };
        }
      }
    }
  };

  const headerInfo = getHeaderInfo();

  if (isTabRoot && currentView.tab === 'home') {
    return (
      <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                  ClassTrack
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold">
                  Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none">
                Tu clase, en orden
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Cambiar tema"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Profile Avatar */}
            <button
              onClick={() => navigateTo({ type: 'tab', tab: 'more' })}
              className="flex items-center gap-2 pl-1 pr-1.5 py-1 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center border-2 border-blue-500/20">
                {teacher.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
            </button>
          </div>
        </div>
      </header>
    );
  }

  // Header for other tabs or subpages
  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 px-4 py-3">
      <div className="flex items-center justify-between max-w-lg mx-auto gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {!isTabRoot && (
            <button
              onClick={navigateBack}
              className="w-10 h-10 rounded-2xl -ml-1 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              aria-label="Regresar"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <div className="min-w-0">
            <h1 className="text-base font-bold text-slate-900 dark:text-white truncate leading-tight">
              {headerInfo.title}
            </h1>
            {headerInfo.subtitle && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {headerInfo.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right slot */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Cambiar tema"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
