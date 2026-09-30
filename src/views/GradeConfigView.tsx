import React, { useState } from 'react';
import {
  Info,
  Headphones,
  BookOpen,
  Mic,
  Plus,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Percent,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SkillType, SubGradeConfig } from '../types';
import { Button } from '../components/common/Button';
import { BottomSheet } from '../components/common/BottomSheet';
import { Input } from '../components/common/Input';

export const GradeConfigView: React.FC<{ courseId: string }> = ({ courseId }) => {
  const {
    courses,
    updateSkillWeights,
    addSubGradeConfig,
    updateSubGradeConfig,
    deleteSubGradeConfig,
  } = useApp();

  const course = courses.find((c) => c.id === courseId);

  // Accordion state
  const [openSkills, setOpenSkills] = useState<Record<SkillType, boolean>>({
    listening: true,
    reading: true,
    speaking: true,
  });

  // Modal to add or edit sub-grade
  const [subGradeModal, setSubGradeModal] = useState<{
    isOpen: boolean;
    skill: SkillType;
    editingItem?: SubGradeConfig;
  }>({
    isOpen: false,
    skill: 'listening',
  });

  const [subName, setSubName] = useState('');
  const [subWeight, setSubWeight] = useState('50');

  // Skill weights editing modal
  const [weightsModalOpen, setWeightsModalOpen] = useState(false);
  const [wListening, setWListening] = useState(course?.skillWeights.listening || 30);
  const [wReading, setWReading] = useState(course?.skillWeights.reading || 35);
  const [wSpeaking, setWSpeaking] = useState(course?.skillWeights.speaking || 35);

  if (!course) {
    return <div className="p-6 text-center text-sm text-slate-500">Curso no encontrado.</div>;
  }

  const toggleSkill = (skill: SkillType) => {
    setOpenSkills((prev) => ({ ...prev, [skill]: !prev[skill] }));
  };

  const weightsSum =
    course.skillWeights.listening +
    course.skillWeights.reading +
    course.skillWeights.speaking;

  const handleOpenAddSub = (skill: SkillType) => {
    setSubName('');
    const currentSubs = course.subGradeConfigs[skill] || [];
    // Suggest balanced weight
    const suggested = currentSubs.length > 0 ? Math.floor(100 / (currentSubs.length + 1)) : 100;
    setSubWeight(String(suggested));
    setSubGradeModal({ isOpen: true, skill });
  };

  const handleOpenEditSub = (skill: SkillType, item: SubGradeConfig) => {
    setSubName(item.name);
    setSubWeight(String(item.weightPercent));
    setSubGradeModal({ isOpen: true, skill, editingItem: item });
  };

  const handleSaveSubGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) return;
    const weightNum = parseFloat(subWeight) || 0;

    if (subGradeModal.editingItem) {
      updateSubGradeConfig(
        course.id,
        subGradeModal.skill,
        subGradeModal.editingItem.id,
        subName.trim(),
        weightNum
      );
    } else {
      addSubGradeConfig(course.id, subGradeModal.skill, subName.trim(), weightNum);
    }
    setSubGradeModal({ isOpen: false, skill: 'listening' });
  };

  const handleAutoAdjustWeights = () => {
    updateSkillWeights(course.id, { listening: 30, reading: 35, speaking: 35 });
  };

  const handleSaveWeightsModal = (e: React.FormEvent) => {
    e.preventDefault();
    updateSkillWeights(course.id, {
      listening: Number(wListening),
      reading: Number(wReading),
      speaking: Number(wSpeaking),
    });
    setWeightsModalOpen(false);
  };

  const skillInfo: {
    type: SkillType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bg: string;
    barColor: string;
    weight: number;
  }[] = [
    {
      type: 'listening',
      label: 'Listening',
      icon: Headphones,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/50',
      barColor: 'bg-blue-600',
      weight: course.skillWeights.listening,
    },
    {
      type: 'reading',
      label: 'Reading',
      icon: BookOpen,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
      barColor: 'bg-emerald-600',
      weight: course.skillWeights.reading,
    },
    {
      type: 'speaking',
      label: 'Speaking',
      icon: Mic,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/50',
      barColor: 'bg-purple-600',
      weight: course.skillWeights.speaking,
    },
  ];

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Explanation Card matching screenshot 4 */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Cómo se calcula la nota final
          </h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Cada habilidad representa un porcentaje de la nota final. Dentro de cada habilidad, puedes registrar varias sub-notas (quizzes, lecturas, orales) con su propia ponderación interna.
        </p>

        {/* 3 Skill weight badges (Listening 30%, Reading 35%, Speaking 35%) */}
        <div className="grid grid-cols-3 gap-2 mt-3.5">
          {skillInfo.map((s) => (
            <div
              key={s.type}
              onClick={() => {
                setWListening(course.skillWeights.listening);
                setWReading(course.skillWeights.reading);
                setWSpeaking(course.skillWeights.speaking);
                setWeightsModalOpen(true);
              }}
              className={`p-2.5 rounded-2xl ${s.bg} border border-slate-200/50 dark:border-slate-700/50 flex flex-col items-center justify-center cursor-pointer hover:opacity-90 active:scale-98 transition-all`}
            >
              <span className={`text-xs font-bold ${s.color}`}>{s.label}</span>
              <strong className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                {s.weight}%
              </strong>
            </div>
          ))}
        </div>

        {/* Validation warning if weights don't sum to 100 */}
        {weightsSum !== 100 && (
          <div className="mt-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Los porcentajes suman {weightsSum}% (deben ser 100%)</span>
            </div>
            <button
              onClick={handleAutoAdjustWeights}
              className="px-2.5 py-1 rounded-xl bg-amber-600 text-white font-bold text-[11px] shrink-0"
            >
              Auto-ajustar
            </button>
          </div>
        )}
      </div>

      {/* Accordions for each skill (Listening, Reading, Speaking) */}
      <div className="flex flex-col gap-3">
        {skillInfo.map((skill) => {
          const isOpen = openSkills[skill.type];
          const subConfigs = course.subGradeConfigs[skill.type] || [];
          const Icon = skill.icon;
          const subTotalWeight = subConfigs.reduce(
            (acc, curr) => acc + Number(curr.weightPercent),
            0
          );

          return (
            <div
              key={skill.type}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xs transition-all"
            >
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => toggleSkill(skill.type)}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl ${skill.bg} ${skill.color} flex items-center justify-center`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {skill.label}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {subConfigs.length} sub-nota{subConfigs.length === 1 ? '' : 's'} · Suma interna: {subTotalWeight}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-extrabold ${skill.color}`}>
                    {skill.weight}%
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Accordion Content */}
              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-50 dark:border-slate-800/60 flex flex-col gap-2.5">
                  {subConfigs.length > 0 ? (
                    subConfigs.map((sc) => (
                      <div
                        key={sc.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60"
                      >
                        <div className="flex-1 pr-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {sc.name}
                            </span>
                            <span className="text-xs font-semibold text-slate-500 tabular-nums">
                              {sc.weightPercent}%
                            </span>
                          </div>
                          {/* Visual progress bar */}
                          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${skill.barColor}`}
                              style={{ width: `${Math.min(100, sc.weightPercent)}%` }}
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleOpenEditSub(skill.type, sc)}
                            className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors rounded-lg"
                            title="Editar sub-nota"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteSubGradeConfig(course.id, skill.type, sc.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-lg"
                            title="Eliminar sub-nota"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 py-1">
                      No hay sub-notas en esta habilidad.
                    </p>
                  )}

                  {/* Add subgrade button */}
                  <button
                    onClick={() => handleOpenAddSub(skill.type)}
                    className="w-full py-2.5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-400 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar sub-nota a {skill.label}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal to add/edit SubGrade */}
      <BottomSheet
        isOpen={subGradeModal.isOpen}
        onClose={() => setSubGradeModal({ isOpen: false, skill: 'listening' })}
        title={subGradeModal.editingItem ? 'Editar sub-nota' : 'Nueva sub-nota'}
        description={`Para la habilidad de ${subGradeModal.skill.toUpperCase()}`}
      >
        <form onSubmit={handleSaveSubGrade} className="flex flex-col gap-4 pb-4">
          <Input
            label="Nombre de la sub-nota"
            placeholder="ej. Quiz 1, Lectura comprensiva, Oral test..."
            value={subName}
            onChange={(e) => setSubName(e.target.value)}
            autoFocus
          />

          <Input
            label="Porcentaje interno (%)"
            type="number"
            min="1"
            max="100"
            placeholder="50"
            value={subWeight}
            onChange={(e) => setSubWeight(e.target.value)}
            helperText="Porcentaje con el que promedia dentro de esta habilidad"
          />

          <div className="flex items-center gap-2 mt-2">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setSubGradeModal({ isOpen: false, skill: 'listening' })}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" fullWidth>
              Guardar sub-nota
            </Button>
          </div>
        </form>
      </BottomSheet>

      {/* Modal to edit main skill weights */}
      <BottomSheet
        isOpen={weightsModalOpen}
        onClose={() => setWeightsModalOpen(false)}
        title="Porcentajes por habilidad"
        description="Ajusta la ponderación general del curso (deben sumar 100%)"
      >
        <form onSubmit={handleSaveWeightsModal} className="flex flex-col gap-4 pb-4">
          <Input
            label="Listening (%)"
            type="number"
            value={wListening}
            onChange={(e) => setWListening(Number(e.target.value))}
          />
          <Input
            label="Reading (%)"
            type="number"
            value={wReading}
            onChange={(e) => setWReading(Number(e.target.value))}
          />
          <Input
            label="Speaking (%)"
            type="number"
            value={wSpeaking}
            onChange={(e) => setWSpeaking(Number(e.target.value))}
          />

          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold flex items-center justify-between">
            <span>Suma total:</span>
            <span
              className={
                Number(wListening) + Number(wReading) + Number(wSpeaking) === 100
                  ? 'text-emerald-600 font-bold'
                  : 'text-rose-500 font-bold'
              }
            >
              {Number(wListening) + Number(wReading) + Number(wSpeaking)}%
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setWeightsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" fullWidth>
              Guardar ponderaciones
            </Button>
          </div>
        </form>
      </BottomSheet>
    </div>
  );
};
