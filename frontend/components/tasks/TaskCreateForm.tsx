"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { VALIDATION, COUNTER_THRESHOLD } from "@/lib/types";
import type { CreateTaskInput } from "@/lib/types";

interface TaskCreateFormProps {
  onSubmit: (input: CreateTaskInput) => Promise<void>;
  onCancel?: () => void;
}

export function TaskCreateForm({ onSubmit, onCancel }: TaskCreateFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleError, setTitleError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    setSubmitError(null);

    const error = validateTitle(title);
    if (error) {
      setTitleError(error);
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
      });
      // Clear form on success
      setTitle("");
      setDescription("");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create task");
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
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white border border-neutral-200 rounded-lg">
      <h3 className="font-medium text-neutral-900">Add New Task</h3>

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
          placeholder="What needs to be done?"
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
          htmlFor="description"
          className="block text-sm font-medium text-neutral-700 mb-1"
        >
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details..."
          disabled={isSubmitting}
          maxLength={VALIDATION.DESCRIPTION_MAX_LENGTH}
          rows={3}
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

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
          Add Task
        </Button>
      </div>
    </form>
  );
}
