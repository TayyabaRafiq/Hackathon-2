"use client";

import type { Task } from "@/lib/types";
import { TaskItem } from "./TaskItem";
import { EmptyState } from "./EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onRetry: () => void;
}

export function TaskList({
  tasks,
  isLoading,
  error,
  onToggle,
  onEdit,
  onDelete,
  onRetry,
}: TaskListProps) {
  if (isLoading) {
    return <LoadingSkeleton variant="task" count={3} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (tasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
