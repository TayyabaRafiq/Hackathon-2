"use client";

type SkeletonVariant = "task" | "text" | "card";

interface LoadingSkeletonProps {
  variant?: SkeletonVariant;
  count?: number;
}

function TaskSkeleton() {
  return (
    <div className="p-4 border border-neutral-200 rounded-lg animate-pulse">
      <div className="flex items-start gap-3">
        {/* Checkbox skeleton */}
        <div className="w-5 h-5 bg-neutral-200 rounded mt-0.5" />

        <div className="flex-1">
          {/* Title skeleton */}
          <div className="h-5 bg-neutral-200 rounded w-3/4 mb-2" />
          {/* Description skeleton */}
          <div className="h-4 bg-neutral-200 rounded w-1/2" />
        </div>

        {/* Action buttons skeleton */}
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-neutral-200 rounded" />
          <div className="w-8 h-8 bg-neutral-200 rounded" />
        </div>
      </div>
    </div>
  );
}

function TextSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-neutral-200 rounded w-full mb-2" />
      <div className="h-4 bg-neutral-200 rounded w-5/6" />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="p-6 border border-neutral-200 rounded-lg animate-pulse">
      <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4" />
      <div className="h-4 bg-neutral-200 rounded w-full mb-2" />
      <div className="h-4 bg-neutral-200 rounded w-4/5 mb-2" />
      <div className="h-4 bg-neutral-200 rounded w-2/3" />
    </div>
  );
}

export function LoadingSkeleton({
  variant = "text",
  count = 1,
}: LoadingSkeletonProps) {
  const Skeleton = {
    task: TaskSkeleton,
    text: TextSkeleton,
    card: CardSkeleton,
  }[variant];

  return (
    <div className="space-y-3" role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
