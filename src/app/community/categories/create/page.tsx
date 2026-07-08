'use client';

import React from 'react';
import LinkNext from 'next/link';
import { CommunityAuthGuard } from '../../../../components/auth/CommunityAuthGuard';

export default function CreateCategoryPage() {
  return (
    <CommunityAuthGuard>
      <div className="min-h-screen bg-bg-body py-10 px-4 md:px-8 text-text-primary">
        <div className="max-w-xl mx-auto text-center bg-bg-card border border-border-color rounded-2xl p-8 shadow-sm">
          <div className="w-16 h-16 bg-color-accent-light text-accent rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
            <i className="fas fa-folder-plus"></i>
          </div>
          <h1 className="text-2xl font-extrabold mb-2 text-text-primary">Create Category</h1>
          <p className="text-text-secondary mb-6 text-sm">
            Suggest or create a new category to expand the scope of interview subjects. Our editorial board reviews all category requests to maintain catalog high quality.
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
