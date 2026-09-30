import React, { useState } from 'react';
import { Course, Student, SkillType } from '../../types';
import { useApp } from '../../context/AppContext';
import { BottomSheet } from '../common/BottomSheet';
import { Button } from '../common/Button';
import { Check, Delete, Trash2 } from 'lucide-react';

interface GradeEditorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  course: Course;
  skill: SkillType;
  subGradeId: string;
  subGradeName: string;
}

export const GradeEditorSheet: React.FC<GradeEditorSheetProps> = ({
  isOpen,
  onClose,
  student,
  course,
  skill,
  subGradeId,
  subGradeName,
}) => {
  const { setStudentGrade } = useApp();
  const currentVal = student.grades[skill]?.[subGradeId];

  const isScale100 = course.gradeScale === '100';
  const [inputValue, setInputValue] = useState<string>(
    currentVal !== null && currentVal !== undefined ? String(currentVal) : ''
  );

  const skillLabels = {
    listening: 'Listening',
    reading: 'Reading',
    speaking: 'Speaking',
  };

  const handleSave = (valToSave: number | null) => {
    setStudentGrade(student.id, skill, subGradeId, valToSave);
    onClose();
  };

  const quickScores10 = [10.0, 9.5, 9.0, 8.5, 8.0, 7.5, 7.0, 6.5, 6.0, 5.0];
  const quickScores100 = [100, 95, 90, 85, 80, 75, 70, 65, 60, 50];
  const quickScores = isScale100 ? quickScores100 : quickScores10;

  const handleKeypadPress = (key: string) => {
    if (key === 'C') {
      setInputValue('');
    } else if (key === 'DEL') {
      setInputValue((prev) => prev.slice(0, -1));
    } else if (key === '.') {
      if (!inputValue.includes('.')) {
        setInputValue((prev) => (prev ? prev + '.' : '0.'));
      }
    } else {
      // number
      const next = inputValue + key;
      const num = parseFloat(next);
      const max = isScale100 ? 100 : 10;
      if (!isNaN(num) && num <= max) {
        setInputValue(next);
      }
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`Calificar ${subGradeName}`}
      description={`${student.name} · ${skillLabels[skill]}`}
    >
      <div className="flex flex-col gap-4 pb-4">
        {/* Current score display */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Nota asignada:
          </span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 tabular-nums">
              {inputValue ? inputValue : '-'}
            </span>
            <span className="text-xs text-slate-400">/ {course.gradeScale || '10'}</span>
          </div>
        </div>

        {/* Quick score buttons */}
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">
            Notas rápidas comunes:
          </span>
          <div className="grid grid-cols-5 gap-2">
            {quickScores.map((score) => (
              <button
                key={score}
                onClick={() => {
                  setInputValue(String(score));
                  handleSave(score);
                }}
                className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all active:scale-95 ${
                  parseFloat(inputValue) === score
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {score.toFixed(isScale100 ? 0 : 1)}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Keypad */}
        <div className="grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'DEL'].map(
            (key) => (
              <button
                key={key}
                onClick={() => handleKeypadPress(key)}
                className="h-11 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm border border-slate-200 dark:border-slate-700 active:scale-95 transition-transform flex items-center justify-center shadow-xs"
              >
                {key === 'DEL' ? <Delete className="w-5 h-5 text-slate-400" /> : key}
              </button>
            )
          )}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleSave(null)}
            className="text-rose-600 dark:text-rose-400"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Sin calificar
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={() => {
              const num = parseFloat(inputValue);
              if (!isNaN(num)) {
                handleSave(num);
              } else {
                handleSave(null);
              }
            }}
          >
            <Check className="w-4 h-4 mr-1" />
            Guardar nota
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};
