import { useState } from 'react';

export const useFieldUpdate = (onSave, value) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    // Prevent saving if value hasn't changed
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(editValue);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Save failed:', err);
      setError(err.message || 'Failed to save. Please try again.');
      // Keep editing mode open on error
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setIsEditing(false);
    setError(null);
  };

  const startEditing = () => {
    setEditValue(value || '');
    setIsEditing(true);
    setError(null);
  };

  return {
    isEditing,
    editValue,
    isSaving,
    error,
    setEditValue,
    setError,
    handleSave,
    handleCancel,
    startEditing,
  };
};
