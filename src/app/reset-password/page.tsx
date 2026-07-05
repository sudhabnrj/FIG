import React, { Suspense } from 'react';
import { ResetPasswordForm } from '../../components/auth/ResetPasswordForm';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';

export default function ResetPasswordPage() {
  return (
    <main className="container py-12 px-4 md:px-8 mx-auto flex-1 flex items-center justify-center min-h-[calc(100vh-280px)]">
      <ErrorBoundary fallbackTitle="Reset Password Error">
        <Suspense fallback={
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
