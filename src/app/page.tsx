import { questionsService } from '../lib/services/questionsService';
import { Sidebar } from '../components/layout/Sidebar';
import QuestionContainer from '../components/question/QuestionContainer';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { Hero } from '../components/layout/Hero';
import React from 'react';

export const revalidate = 3600; // static generation with 1 hour revalidation

export default async function Page() {
  // Load questions on the server
  const questions = await questionsService.fetchQuestions();

  return (
    <>
      <ErrorBoundary fallbackTitle="Hero Load Error">
        <Hero />
      </ErrorBoundary>
      <main className="container-fluid py-6 px-4 md:px-8 mx-auto flex-1">
        <div className="row g-4 flex flex-col md:flex-row gap-6">
          {/* Desktop Left Sidebar */}
          <ErrorBoundary fallbackTitle="Sidebar Load Error">
            <Sidebar />
          </ErrorBoundary>

          {/* Right Main Column with Questions list container */}
          <ErrorBoundary fallbackTitle="Questions List Error">
            <QuestionContainer initialQuestions={questions} />
          </ErrorBoundary>
        </div>
      </main>
    </>
  );
}
