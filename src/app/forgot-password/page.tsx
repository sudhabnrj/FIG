import React from 'react';
import { ForgotPasswordForm } from '../../components/auth/ForgotPasswordForm';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';

export default function ForgotPasswordPage() {
  return (
    <main className="container py-12 px-4 md:px-8 mx-auto flex-1 flex items-center justify-center min-h-[calc(100vh-280px)]">
      <ErrorBoundary fallbackTitle="Forgot Password Error">
        <ForgotPasswordForm />
      </ErrorBoundary>
    </main>
  );
}
