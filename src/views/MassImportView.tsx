import React, { useState, useMemo } from 'react';
import { CheckCircle2, AlertCircle, ArrowLeft, Lightbulb, Users, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';

// Utility to clean and capitalize name properly
function cleanAndCapitalizeName(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word) => {
      if (!word) return '';
      // lowercase then capitalize first letter, respecting accented vowels
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

// Parses multiline or comma separated text into a list of unique clean student names
function parseNames(text: string): { names: string[]; duplicates: string[] } {
  if (!text.trim()) return { names: [], duplicates: [] };

  // Split by newlines OR commas OR semicolons
  const items = text.split(/[\n,;]+/);
  const seen = new Set<string>();
  const names: string[] = [];
  const duplicates: string[] = [];

  for (const item of items) {
    const cleaned = cleanAndCapitalizeName(item);
    if (!cleaned) continue;

    const lower = cleaned.toLowerCase();
    if (seen.has(lower)) {
      if (!duplicates.includes(cleaned)) {
        duplicates.push(cleaned);
      }
    } else {
      seen.add(lower);
      names.push(cleaned);
    }
  }

  return { names, duplicates };
}

export const MassImportView: React.FC<{ courseId: string }> = ({ courseId }) => {
  const { courses, students, addStudentsBatch, navigateBack, navigateTo } = useApp();
  const course = courses.find((c) => c.id === courseId);

  const [rawText, setRawText] = useState(
    'Pedro Andrés\nMaría José\nJuan David\nLaura Gómez\nCarlos Ruiz\nDaniela Mora'
  );

  const existingStudentNames = useMemo(() => {
    return new Set(
      students
        .filter((s) => s.courseId === courseId)
        .map((s) => s.name.toLowerCase().trim())
    );
  }, [students, courseId]);

  const { names: detectedNames, duplicates: internalDuplicates } = useMemo(
    () => parseNames(rawText),
    [rawText]
  );

  // Cross check against already existing students in this course
  const alreadyInCourse = useMemo(() => {
    return detectedNames.filter((name) => existingStudentNames.has(name.toLowerCase()));
  }, [detectedNames, existingStudentNames]);

  const newNamesToAdd = useMemo(() => {
    return detectedNames.filter((name) => !existingStudentNames.has(name.toLowerCase()));
  }, [detectedNames, existingStudentNames]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // If Enter pressed without shift, submit if there are valid names
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (newNamesToAdd.length === 0) return;
    addStudentsBatch(courseId, newNamesToAdd);
    navigateTo({ type: 'course-detail', courseId, subTab: 'students' });
  };

  if (!course) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-slate-500">Curso no encontrado.</p>
        <Button variant="secondary" onClick={navigateBack} className="mt-3">
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Header explanation */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-100 dark:border-slate-800">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Carga masiva para {course.name}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Pega la lista de nombres (uno por línea o separados por comas). Presiona{' '}
          <strong className="text-slate-800 dark:text-slate-200">Enter</strong> para
          procesar o <strong className="text-slate-800 dark:text-slate-200">Shift + Enter</strong> para una nueva línea.
        </p>
      </div>

      {/* Notebook styled text area */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs">
        <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-medium">
          <span>Bloc de notas de estudiantes</span>
          <button
            type="button"
            onClick={() => setRawText('')}
            className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors"
          >
            Limpiar bloc
          </button>
        </div>

        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={9}
          placeholder="Pedro Andrés&#10;María José&#10;Juan David&#10;Laura Gómez..."
          className="w-full p-4 font-mono text-sm leading-8 notebook-lines border-none focus:outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 resize-none"
        />
      </div>

      {/* Live Counter & Status */}
      <div className="flex flex-col gap-2">
        <div
          className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${
            detectedNames.length > 0
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-slate-100 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2
              className={`w-5 h-5 ${
                detectedNames.length > 0 ? 'text-emerald-600' : 'text-slate-400'
              }`}
            />
            <span className="text-xs font-bold">
              {detectedNames.length} estudiante{detectedNames.length === 1 ? '' : 's'} detectado{detectedNames.length === 1 ? '' : 's'}
            </span>
          </div>

          {newNamesToAdd.length !== detectedNames.length && (
            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300">
              ({alreadyInCourse.length} ya registrados)
            </span>
          )}
        </div>

        {/* Warnings for duplicates if any */}
        {(internalDuplicates.length > 0 || alreadyInCourse.length > 0) && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <span className="font-semibold">Nombres repetidos o existentes:</span>
              <p className="mt-0.5 text-[11px] leading-relaxed">
                {[...internalDuplicates, ...alreadyInCourse].slice(0, 5).join(', ')}
                {[...internalDuplicates, ...alreadyInCourse].length > 5 && ' ... y más'} serán omitidos automáticamente.
              </p>
            </div>
          </div>
        )}

        {/* Preview Chips */}
        {detectedNames.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-3.5 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-2">
              Vista previa ({detectedNames.length}):
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {detectedNames.map((name, i) => {
                const isDup = existingStudentNames.has(name.toLowerCase());
                return (
                  <span
                    key={i}
                    className={`text-xs px-2.5 py-1 rounded-xl font-medium border flex items-center gap-1 ${
                      isDup
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-700 dark:text-amber-300 line-through'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span>{name}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          variant="success"
          size="lg"
          fullWidth
          disabled={newNamesToAdd.length === 0}
          onClick={handleSubmit}
          className="mt-1 shadow-md shadow-emerald-600/20"
        >
          <Plus className="w-5 h-5 mr-1" />
          <span>
            Agregar {newNamesToAdd.length > 0 ? `${newNamesToAdd.length} estudiantes` : 'estudiantes'}
          </span>
        </Button>
      </div>

      {/* Tip card from screenshot */}
      <div className="p-4 rounded-3xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-200">
        <div className="w-8 h-8 rounded-2xl bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-300">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <strong className="block font-bold">Tip de productividad:</strong>
          <p className="mt-0.5 text-blue-800/80 dark:text-blue-300/80 leading-relaxed text-[11px]">
            Puedes copiar y pegar listas enteras desde Excel, Google Sheets, correos o documentos Word. El sistema limpia los espacios, capitaliza los nombres y descarta duplicados.
          </p>
        </div>
      </div>
    </div>
  );
};
