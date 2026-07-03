import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="bg-cardBg border border-border-custom rounded-lg p-6 mb-6 animate-pulse shadow-card">
    <div className="flex justify-between items-center mb-4">
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-slate-200 rounded-full"></div>
        <div className="h-5 w-24 bg-slate-200 rounded-full"></div>
      </div>
      <div className="h-4 w-20 bg-slate-200 rounded"></div>
    </div>
    <div className="h-6 w-3/4 bg-slate-200 rounded mb-4"></div>
    <div className="flex gap-4">
      <div className="h-4 w-16 bg-slate-200 rounded"></div>
      <div className="h-4 w-16 bg-slate-200 rounded"></div>
      <div className="h-4 w-16 bg-slate-200 rounded"></div>
    </div>
  </div>
);

export const SidebarSkeleton: React.FC = () => (
  <aside className="col-md-4 col-xl-4 hidden md:block">
    <div className="p-4 bg-white/70 border border-border-custom rounded-lg animate-pulse shadow-sidebar">
      <div className="h-4 w-24 bg-slate-200 rounded mb-4"></div>
      <div className="space-y-3 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between items-center h-10 bg-slate-200 rounded px-4"></div>
        ))}
      </div>
      <div className="h-4 w-28 bg-slate-200 rounded mb-4"></div>
      <div className="space-y-2">
        <div className="h-10 bg-slate-200 rounded"></div>
        <div className="h-10 bg-slate-200 rounded"></div>
      </div>
    </div>
  </aside>
);

export const QuestionListSkeleton: React.FC = () => (
  <div className="space-y-4 w-full">
    <div className="h-8 w-48 bg-slate-200 rounded mb-4"></div>
    <CardSkeleton />
    <CardSkeleton />
    <CardSkeleton />
  </div>
);
