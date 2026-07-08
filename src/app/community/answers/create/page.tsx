'use client';

import React from 'react';
import LinkNext from 'next/link';
import { CommunityAuthGuard } from '../../../../components/auth/CommunityAuthGuard';

export default function CreateAnswerPage() {
  return (
    <CommunityAuthGuard>
      <div className="min-h-screen bg-bg-body py-10 px-4 md:px-8 text-text-primary">
        <div className="max-w-xl mx-auto text-center bg-bg-card border border-border-color rounded-2xl p-8 shadow-sm">
          <div className="w-16 h-16 bg-color-primary-light text-primary rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
            <i className="fas fa-comment-dots"></i>
          </div>
          <h1 className="text-2xl font-extrabold mb-2 text-text-primary">Create Answer</h1>
          <p className="text-text-secondary mb-6 text-sm">
            The ability to submit answers directly via individual links is coming soon. In the meantime, you can provide answers directly when contributing new questions.
          </p>
          <LinkNext
            href="/community"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/95 transition-all shadow active:scale-95 text-sm cursor-pointer"
          >
            <i className="fas fa-arrow-left"></i> Back to Community Hub
          </LinkNext>
        </div>
      </div>
    </CommunityAuthGuard>
  );
}
