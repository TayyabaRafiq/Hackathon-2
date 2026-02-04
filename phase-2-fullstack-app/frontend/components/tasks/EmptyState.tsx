"use client";

export function EmptyState() {
  return (
    <div className="text-center py-12">
      {/* Empty state icon */}
      <div className="w-16 h-16 mx-auto mb-4 text-neutral-300">
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      </div>

      <h3 className="text-lg font-medium text-neutral-900 mb-1">
        No tasks yet
      </h3>

      <p className="text-neutral-500">
        Create your first task to get started
      </p>
    </div>
  );
}
