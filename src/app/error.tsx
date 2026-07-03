'use client';

import React, { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Unhandled runtime exception:', error);
  }, [error]);

  return (
    <main className="container mx-auto py-20 px-4 text-center max-w-xl">
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-8 shadow-card">
        <i className="fas fa-exclamation-triangle text-4xl mb-4 text-[#ef4444]"></i>
        <h2 className="text-xl font-bold mb-2">Something went wrong!</h2>
        <p className="text-sm text-[#64748b] mt-1 mb-6">
          An unexpected error occurred in the application. Please try again.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => reset()}
            className="bg-primary text-white hover:bg-primary/95 text-xs font-semibold py-2.5 px-6 rounded cursor-pointer border-0 shadow-sm transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-white hover:bg-slate-50 text-text-secondary border border-border-custom text-xs font-semibold py-2.5 px-6 rounded cursor-pointer transition-colors"
          >
            Reload page
          </button>
        </div>
      </div>
    </main>
  );
}
