"use client";

import type { Task } from "@/lib/types";

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  return (
    <div
      className={`
        p-4 border rounded-lg transition-colors
        ${task.completed ? "bg-neutral-50 border-neutral-200" : "bg-white border-neutral-200 hover:border-neutral-300"}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task)}
          className="
            mt-0.5 flex-shrink-0
            w-5 h-5 rounded border-2
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
          "
          style={{
            backgroundColor: task.completed ? "#2563eb" : "transparent",
            borderColor: task.completed ? "#2563eb" : "#d4d4d4",
          }}
          aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {task.completed && (
            <svg
              className="w-full h-full text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={`
              font-medium
              ${task.completed ? "text-neutral-500 line-through" : "text-neutral-900"}
            `}
          >
            {task.title}
          </h3>
          {task.description && (
            <p
              className={`
                mt-1 text-sm truncate
                ${task.completed ? "text-neutral-400" : "text-neutral-600"}
              `}
            >
              {task.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="
              p-2 rounded-md
              text-neutral-500 hover:text-blue-600 hover:bg-blue-50
              focus:outline-none focus:ring-2 focus:ring-blue-500
              transition-colors
            "
            aria-label="Edit task"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task)}
            className="
              p-2 rounded-md
              text-neutral-500 hover:text-red-600 hover:bg-red-50
              focus:outline-none focus:ring-2 focus:ring-red-500
              transition-colors
            "
            aria-label="Delete task"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
