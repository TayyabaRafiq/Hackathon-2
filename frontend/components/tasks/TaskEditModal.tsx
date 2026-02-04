"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { VALIDATION, COUNTER_THRESHOLD } from "@/lib/types";
import type { Task, UpdateTaskInput } from "@/lib/types";

interface TaskEditModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, input: UpdateTaskInput) => Promise<void>;
}

export function TaskEditModal({
  task,
  isOpen,
  onClose,
  onSave,
}: TaskEditModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleError, setTitleError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setTitleError(undefined);
      setSubmitError(null);
    }
  }, [task]);

  const validateTitle = (value: string): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) {
      return "Title is required";
    }
    if (trimmed.length > VALIDATION.TITLE_MAX_LENGTH) {
      return `Title must be ${VALIDATION.TITLE_MAX_LENGTH} characters or less`;
    }
    return undefined;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!task) return;

    setSubmitError(null);

    const error = validateTitle(title);
    if (error) {
      setTitleError(error);
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to update task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    if (titleError) {
      setTitleError(validateTitle(value));
    }
  };

  const showTitleCounter = title.length >= COUNTER_THRESHOLD.TITLE;
  const showDescCounter = description.length >= COUNTER_THRESHOLD.DESCRIPTION;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        {submitError && (
          <div
            className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm"
            role="alert"
          >
            {submitError}
          </div>
        )}

        <div>
          <Input
            label="Title"
            name="title"
            value={title}
            onChange={handleTitleChange}
            error={titleError}
            placeholder="Task title"
            disabled={isSubmitting}
            maxLength={VALIDATION.TITLE_MAX_LENGTH}
          />
          {showTitleCounter && (
            <p className="mt-1 text-xs text-neutral-500 text-right">
              {title.length}/{VALIDATION.TITLE_MAX_LENGTH}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="edit-description"
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            Description (optional)
          </label>
          <textarea
            id="edit-description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details..."
            disabled={isSubmitting}
            maxLength={VALIDATION.DESCRIPTION_MAX_LENGTH}
            rows={4}
            className="
              w-full px-3 py-2
              border border-neutral-300 rounded-md
              text-neutral-900
              placeholder:text-neutral-400
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-neutral-100 disabled:cursor-not-allowed
              resize-none
            "
          />
          {showDescCounter && (
            <p className="mt-1 text-xs text-neutral-500 text-right">
              {description.length}/{VALIDATION.DESCRIPTION_MAX_LENGTH}
            </p>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
