-- CreateIndex
CREATE INDEX "tasks_userId_completed_createdAt_idx" ON "tasks"("userId", "completed", "createdAt");
