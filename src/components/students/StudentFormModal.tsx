import React, { useState, useEffect } from 'react';
import { Student } from '../../types';
import { BottomSheet } from '../common/BottomSheet';
import { Input, Textarea } from '../common/Input';
import { Button } from '../common/Button';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; email?: string; notes?: string }) => void;
  initialData?: Student | null;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setEmail(initialData.email || '');
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setEmail('');
      setNotes('');
    }
    setError(undefined);
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre del estudiante es obligatorio.');
      return;
    }

    onSubmit({
      name: name.trim(),
      email: email.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar estudiante' : 'Nuevo estudiante'}
      description="Ingresa los datos del alumno"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-4">
        <Input
          label="Nombre completo"
          placeholder="ej. Pedro Andrés Morales"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(undefined);
          }}
          error={error}
          autoFocus
        />

        <Input
          label="Correo electrónico (opcional)"
          type="email"
          placeholder="ej. estudiante@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Textarea
          label="Observaciones o notas (opcional)"
          placeholder="ej. Buen desempeño oral, necesita reforzar gramática..."
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex items-center gap-2.5 mt-2">
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" fullWidth>
            {initialData ? 'Guardar' : 'Agregar'}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
};
