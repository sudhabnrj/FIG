import React from 'react';
import { RegisterForm } from '../../components/auth/RegisterForm';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';

export default function RegisterPage() {
  return (
    <main className="container py-12 px-4 md:px-8 mx-auto flex-1 flex items-center justify-center min-h-[calc(100vh-280px)]">
      <ErrorBoundary fallbackTitle="Register Error">
        <RegisterForm />
      </ErrorBoundary>
    </main>
  );
}
