import type { Metadata } from 'next';
import './globals.css';
import StoreProvider from '../store/StoreProvider';
import { Navbar } from '../components/layout/Navbar';
import { Hero } from '../components/layout/Hero';
import dynamic from 'next/dynamic';
const MobileSidebar = dynamic(
  () => import('../components/layout/MobileSidebar').then((mod) => mod.MobileSidebar),
  { ssr: false }
);
import { Toast } from '../components/ui/Toast';
import { ScrollToTop } from '../components/ui/ScrollToTop';
import React from 'react';
import { questionsService } from '../lib/services/questionsService';

export const metadata: Metadata = {
  title: 'Interview Preparation Guide - AI, UI/UX, React, JavaScript, Next.js',
  description: 'Modern, clean, and interactive Frontend Interview Preparation Q&A Guide covering AI, UI/UX, React, JavaScript, and Next.js.',
  authors: [{ name: 'Frontend Architect' }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch questions on the server-side to initialize the Redux store seamlessly
  const questions = await questionsService.fetchQuestions();

  return (
    <html lang="en">
      <head>
        {/* Font Awesome Icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
          integrity="sha512-z3gLpd7yknf1YoNbCzqRKc4qyor8gaKU1qmn+CShxbuBusANI9QpRohGBreCFkKxLhei6S9CQXFEbbKuqLg0DA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body>
        <StoreProvider initialQuestions={questions}>
          <div className="min-h-screen flex flex-col bg-body">
            {/* Sticky Navbar */}
            <Navbar />

            {/* Hero Banner */}
            <Hero />

            {/* Main Layout and Children Page content */}
            {children}

            {/* Mobile Drawer Menu */}
            <MobileSidebar />

            {/* Footer */}
            <footer className="bg-white border-t border-border-custom py-4 text-center mt-5 text-text-muted text-[0.85rem]">
              <div className="container mx-auto">
                <p className="mb-1">&copy; 2026 Interview Preparation Guide. All Rights Reserved.</p>
                <p className="mb-0 text-text-muted text-[0.75rem]">
                  Redesigned & Modernized with Premium Accessibility and Responsive UX.
                </p>
              </div>
            </footer>

            {/* Scroll back to top */}
            <ScrollToTop />

            {/* Toast Notifications */}
            <Toast />
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
