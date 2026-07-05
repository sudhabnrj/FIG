import React, { Suspense } from 'react';
import { LoginForm } from '../../components/auth/LoginForm';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';

export default function LoginPage() {
  return (
    <main className="container py-12 px-4 md:px-8 mx-auto flex-1 flex items-center justify-center min-h-[calc(100vh-280px)]">
      <ErrorBoundary fallbackTitle="Login Error">
        <Suspense fallback={
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
