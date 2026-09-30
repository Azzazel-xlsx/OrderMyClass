/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastContainer } from './components/common/ToastContainer';
import { AppHeader } from './components/common/AppHeader';
import { BottomNav } from './components/common/BottomNav';

import { HomeView } from './views/HomeView';
import { CoursesView } from './views/CoursesView';
import { ScheduleView } from './views/ScheduleView';
import { AttendanceView } from './views/AttendanceView';
import { MoreView } from './views/MoreView';
import { CourseDetailView } from './views/CourseDetailView';
import { GradeConfigView } from './views/GradeConfigView';
import { MassImportView } from './views/MassImportView';
import { StudentProfileView } from './views/StudentProfileView';

const MainRouter: React.FC = () => {
  const { currentView } = useApp();

  const renderCurrentView = () => {
    switch (currentView.type) {
      case 'tab':
        switch (currentView.tab) {
          case 'home':
            return <HomeView />;
          case 'courses':
            return <CoursesView />;
          case 'schedule':
            return <ScheduleView />;
          case 'attendance':
            return <AttendanceView />;
          case 'more':
            return <MoreView />;
        }
        break;

      case 'course-detail':
        return (
          <CourseDetailView
            courseId={currentView.courseId}
            initialSubTab={currentView.subTab}
          />
        );

      case 'course-grades-config':
        return <GradeConfigView courseId={currentView.courseId} />;

      case 'mass-import':
        return <MassImportView courseId={currentView.courseId} />;

      case 'student-profile':
        return (
          <StudentProfileView
            studentId={currentView.studentId}
            courseId={currentView.courseId}
          />
        );

      case 'attendance-sheet':
        return (
          <AttendanceView
            initialCourseId={currentView.courseId}
            initialDate={currentView.date}
          />
        );

      case 'attendance-history':
        return <AttendanceView initialCourseId={currentView.courseId} />;

      default:
        return <HomeView />;
    }
  };

  // Unique key for view transition
  const viewKey =
    currentView.type === 'tab'
      ? currentView.tab
      : `${currentView.type}-${(currentView as any).courseId || ''}-${(currentView as any).studentId || ''}`;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex justify-center selection:bg-blue-500 selection:text-white">
      {/* Mobile-first centered app shell */}
      <div className="w-full max-w-md min-h-screen bg-slate-50 dark:bg-slate-900 border-x border-slate-200/80 dark:border-slate-800/80 shadow-2xl flex flex-col relative overflow-x-hidden">
        {/* Toast system */}
        <ToastContainer />

        {/* Top App Bar */}
        <AppHeader />

        {/* View Content with fluid page transition */}
        <main className="flex-1 px-4 pt-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={viewKey}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              {renderCurrentView()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Fixed Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainRouter />
    </AppProvider>
  );
}
