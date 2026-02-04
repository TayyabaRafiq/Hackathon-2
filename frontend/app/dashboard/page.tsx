"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskCreateForm } from "@/components/tasks/TaskCreateForm";
import { TaskEditModal } from "@/components/tasks/TaskEditModal";
import { DeleteConfirmDialog } from "@/components/tasks/DeleteConfirmDialog";
import { Button } from "@/components/ui/Button";
import { useTasks } from "@/hooks/useTasks";

export default function DashboardPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const {
    tasks,
    isLoading,
    error,
    editingTask,
    deletingTask,
    fetchTasks,
    createTask,
    updateTask,
    toggleComplete,
    deleteTask,
    setEditingTask,
    setDeletingTask,
  } = useTasks();

  const handleCreateTask = async (input: { title: string; description?: string }) => {
    await createTask(input);
    setShowCreateForm(false);
  };

  const handleEditSave = async (id: string, input: { title?: string; description?: string }) => {
    await updateTask(id, input);
    setEditingTask(null);
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-neutral-900">My Tasks</h2>
          {!showCreateForm && (
            <Button onClick={() => setShowCreateForm(true)}>
              Add Task
            </Button>
          )}
        </div>

        {/* Create form */}
        {showCreateForm && (
          <TaskCreateForm
            onSubmit={handleCreateTask}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {/* Task list */}
        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          error={error}
          onToggle={toggleComplete}
          onEdit={setEditingTask}
          onDelete={setDeletingTask}
          onRetry={fetchTasks}
        />
      </div>

      {/* Edit modal */}
      <TaskEditModal
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleEditSave}
      />

      {/* Delete confirmation */}
      <DeleteConfirmDialog
        task={deletingTask}
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={deleteTask}
      />
    </PageContainer>
  );
}
