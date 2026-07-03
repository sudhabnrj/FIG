import React from 'react';
import { SidebarSkeleton, QuestionListSkeleton } from '../components/ui/Skeletons';

export default function Loading() {
  return (
    <main className="container-fluid py-6 px-4 md:px-8 mx-auto flex-1">
      <div className="row g-4 flex flex-col md:flex-row gap-6">
        {/* Desktop Sidebar loader */}
        <SidebarSkeleton />
        
        {/* Questions list area loader */}
        <section className="col-md-8 col-xl-8 flex-1">
          <QuestionListSkeleton />
        </section>
      </div>
    </main>
  );
}
