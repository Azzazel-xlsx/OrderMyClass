import React, { useState, useEffect } from 'react';
import { Course, CourseColor } from '../../types';
import { BottomSheet } from '../common/BottomSheet';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { COURSE_COLORS } from '../../utils/themeColors';

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    level: string;
    color: CourseColor;
    gradeScale: '10' | '100';
  }) => void;
  initialData?: Course | null;
}

const AVAILABLE_COLORS: { id: CourseColor; label: string; bg: string }[] = [
  { id: 'blue', label: 'Azul', bg: 'bg-blue-600' },
  { id: 'green', label: 'Verde', bg: 'bg-emerald-600' },
  { id: 'orange', label: 'Naranja', bg: 'bg-amber-600' },
  { id: 'purple', label: 'Morado', bg: 'bg-purple-600' },
  { id: 'rose', label: 'Rosa', bg: 'bg-rose-600' },
  { id: 'amber', label: 'Dorado', bg: 'bg-yellow-600' },
];

export const CourseFormModal: React.FC<CourseFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [level, setLevel] = useState('');
  const [color, setColor] = useState<CourseColor>('blue');
  const [gradeScale, setGradeScale] = useState<'10' | '100'>('10');
  const [errors, setErrors] = useState<{ name?: string; level?: string }>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setLevel(initialData.level);
      setColor(initialData.color);
      setGradeScale(initialData.gradeScale || '10');
    } else {
      setName('');
      setLevel('Nivel A1');
      setColor('blue');
      setGradeScale('10');
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; level?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'El nombre del curso es obligatorio.';
    }
    if (!level.trim()) {
      newErrors.level = 'Indica el nivel o descripción.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      name: name.trim(),
      level: level.trim(),
      color,
      gradeScale,
    });
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar curso' : 'Crear nuevo curso'}
      description="Configura los detalles del curso de inglés"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-4">
        <Input
          label="Nombre del curso"
          placeholder="ej. English B2 Conversation"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          error={errors.name}
          autoFocus
        />

        <Input
          label="Nivel / Etiqueta"
          placeholder="ej. Nivel A1, Principiantes, Bilingüe"
          value={level}
          onChange={(e) => {
            setLevel(e.target.value);
            if (errors.level) setErrors((prev) => ({ ...prev, level: undefined }));
          }}
          error={errors.level}
        />

        {/* Color Picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Color identificador
          </label>
          <div className="grid grid-cols-6 gap-2 pt-1">
            {AVAILABLE_COLORS.map((col) => {
              const isSelected = color === col.id;
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => setColor(col.id)}
                  className={`h-11 rounded-2xl ${col.bg} transition-all duration-150 flex items-center justify-center text-white ${
                    isSelected ? 'ring-3 ring-offset-2 ring-blue-500 scale-105 shadow-md' : 'opacity-80 hover:opacity-100'
                  }`}
                  aria-label={col.label}
                >
                  {isSelected && <span className="text-base font-bold">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grade Scale Selector */}
        <div className="flex flex-col gap-1.5 mt-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Escala de evaluación
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setGradeScale('10')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                gradeScale === '10'
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-bold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <div className="text-sm">Escala 0 – 10</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                Decimales: ej. 8.5
              </div>
            </button>
            <button
              type="button"
              onClick={() => setGradeScale('100')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                gradeScale === '100'
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-bold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <div className="text-sm">Escala 0 – 100</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                Puntos: ej. 85 pts
              </div>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 mt-3">
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" fullWidth>
            {initialData ? 'Guardar cambios' : 'Crear curso'}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
};
