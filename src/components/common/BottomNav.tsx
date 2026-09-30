import React from 'react';
import { Home, BookOpen, Calendar, UserCheck, MoreHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'courses', label: 'Cursos', icon: BookOpen },
  { id: 'schedule', label: 'Horario', icon: Calendar },
  { id: 'attendance', label: 'Asistencias', icon: UserCheck },
  { id: 'more', label: 'Más', icon: MoreHorizontal },
];

export const BottomNav: React.FC = () => {
  const { currentView, setActiveTab } = useApp();

  const currentTab = currentView.type === 'tab' ? currentView.tab : null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800/80 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1">
      <div className="max-w-lg mx-auto grid grid-cols-5 items-center px-1">
        {NAV_ITEMS.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 min-h-[48px] rounded-2xl transition-all duration-150 active:scale-95 cursor-pointer relative ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    isActive ? 'scale-110 stroke-[2.5px]' : 'stroke-[1.8px]'
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
