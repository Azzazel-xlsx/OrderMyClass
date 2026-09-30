import React, { useState, useRef } from 'react';
import {
  User,
  GraduationCap,
  BookOpen,
  Calendar,
  Sliders,
  Moon,
  Sun,
  Download,
  Upload,
  FileSpreadsheet,
  RotateCcw,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Heart,
  Edit2,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { BottomSheet } from '../components/common/BottomSheet';
import { Input } from '../components/common/Input';

export const MoreView: React.FC = () => {
  const {
    teacher,
    updateTeacher,
    theme,
    toggleTheme,
    navigateTo,
    resetToDemoData,
    clearAllData,
    exportBackupJson,
    importBackupJson,
    exportGradesCsv,
    exportAttendanceCsv,
    showToast,
  } = useApp();

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profName, setProfName] = useState(teacher.name);
  const [profTitle, setProfTitle] = useState(teacher.title);
  const [profSchool, setProfSchool] = useState(teacher.school);
  const [profEmail, setProfEmail] = useState(teacher.email);

  const [clearDataConfirmOpen, setClearDataConfirmOpen] = useState(false);
  const [clearDataDoubleConfirmOpen, setClearDataDoubleConfirmOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateTeacher({
      name: profName.trim(),
      title: profTitle.trim(),
      school: profSchool.trim(),
      email: profEmail.trim(),
    });
    setProfileModalOpen(false);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `classtrack-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast({
      type: 'success',
      title: 'Respaldo exportado',
      message: 'El archivo JSON se ha descargado en tu dispositivo.',
    });
  };

  const handleDownloadGradesCsv = () => {
    const csvStr = exportGradesCsv();
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notas-alumnos-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast({
      type: 'success',
      title: 'CSV descargado',
      message: 'Planilla de notas generada con éxito.',
    });
  };

  const handleDownloadAttendanceCsv = () => {
    const csvStr = exportAttendanceCsv();
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `asistencias-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast({
      type: 'success',
      title: 'CSV descargado',
      message: 'Historial de asistencias generado con éxito.',
    });
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importBackupJson(content);
      }
    };
    reader.readAsText(file);
    // reset input
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Teacher Profile Card matching Screen 10 */}
      <div
        onClick={() => {
          setProfName(teacher.name);
          setProfTitle(teacher.title);
          setProfSchool(teacher.school);
          setProfEmail(teacher.email);
          setProfileModalOpen(true);
        }}
        className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all active:scale-[0.99]"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-blue-500/20">
            {teacher.name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
              {teacher.name}
            </h3>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold block mt-0.5">
              {teacher.title}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {teacher.school}
            </span>
          </div>
        </div>

        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* Primary Navigation Menu matching Screen 10 */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60">
        <button
          onClick={() => navigateTo({ type: 'tab', tab: 'courses' })}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Mis cursos
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => navigateTo({ type: 'tab', tab: 'schedule' })}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Mi horario
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => navigateTo({ type: 'tab', tab: 'courses' })}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Plantillas de notas
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Theme toggle */}
        <div className="w-full p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Modo oscuro
              </span>
              <span className="text-[10px] text-slate-400">
                {theme === 'dark' ? 'Activado' : 'Desactivado'}
              </span>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center ${
              theme === 'dark' ? 'bg-blue-600 justify-end' : 'bg-slate-200 justify-start'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
          </button>
        </div>
      </div>

      {/* Data Management Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60">
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Respaldos y exportación
          </span>
        </div>

        {/* Export JSON */}
        <button
          onClick={handleDownloadBackup}
          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Download className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Exportar respaldo (JSON)
            </span>
          </div>
          <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-lg">
            Descargar
          </span>
        </button>

        {/* Import JSON */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Upload className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Restaurar respaldo (JSON)
            </span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg">
            Cargar
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileImport}
          className="hidden"
        />

        {/* Export Grades CSV */}
        <button
          onClick={handleDownloadGradesCsv}
          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Exportar notas (CSV para Excel)
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Export Attendance CSV */}
        <button
          onClick={handleDownloadAttendanceCsv}
          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Exportar asistencias (CSV)
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Reset Demo Data */}
        <button
          onClick={resetToDemoData}
          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <RotateCcw className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Cargar datos de demostración
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Clear All */}
        <button
          onClick={() => setClearDataConfirmOpen(true)}
          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              Borrar todos los datos
            </span>
          </div>
          <span className="text-[10px] text-rose-500 font-bold">Doble confirmación</span>
        </button>
      </div>

      {/* Motivational Educational Banner matching Screen 10 */}
      <div className="p-4 rounded-3xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-xs font-extrabold text-blue-950 dark:text-blue-200 leading-snug">
            La educación cambia el mundo, una clase a la vez.
          </h4>
          <p className="text-[11px] text-blue-800/80 dark:text-blue-400 mt-0.5">
            Order my students · Hecho para profesores dedicados.
          </p>
        </div>
      </div>

      {/* Teacher Profile Edit Modal */}
      <BottomSheet
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        title="Perfil del profesor"
        description="Personaliza tu información docente"
      >
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 pb-4">
          <Input
            label="Nombre completo"
            value={profName}
            onChange={(e) => setProfName(e.target.value)}
            required
          />
          <Input
            label="Cargo / Título"
            value={profTitle}
            onChange={(e) => setProfTitle(e.target.value)}
            required
          />
          <Input
            label="Institución / Academia"
            value={profSchool}
            onChange={(e) => setProfSchool(e.target.value)}
          />
          <Input
            label="Correo electrónico"
            type="email"
            value={profEmail}
            onChange={(e) => setProfEmail(e.target.value)}
          />

          <div className="flex items-center gap-2 mt-2">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setProfileModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" fullWidth>
              Guardar perfil
            </Button>
          </div>
        </form>
      </BottomSheet>

      {/* First Clear confirmation */}
      <ConfirmModal
        isOpen={clearDataConfirmOpen}
        onClose={() => setClearDataConfirmOpen(false)}
        onConfirm={() => {
          setClearDataConfirmOpen(false);
          setClearDataDoubleConfirmOpen(true);
        }}
        title="¿Borrar todos los datos?"
        message="Esta acción vaciará todos los cursos, estudiantes, horarios y asistencias de la aplicación. ¿Deseas continuar?"
        confirmText="Continuar a confirmación"
        isDestructive
      />

      {/* Second Clear confirmation */}
      <ConfirmModal
        isOpen={clearDataDoubleConfirmOpen}
        onClose={() => setClearDataDoubleConfirmOpen(false)}
        onConfirm={() => {
          setClearDataDoubleConfirmOpen(false);
          clearAllData();
        }}
        title="⚠️ Doble confirmación requerida"
        message="¿Estás completamente seguro? Perderás todos tus registros locales (podrás deshacer temporalmente desde el aviso emergente)."
        confirmText="Sí, borrar definitivamente"
        isDestructive
      />
    </div>
  );
};
