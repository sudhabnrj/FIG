import React from 'react';

interface HeroProps {
  totalQuestions: number;
}

export const Hero: React.FC<HeroProps> = ({ totalQuestions }) => {
  return (
    <section className="bg-gradient-to-br from-white to-[#f1f5f9] border-b border-border-custom py-14 px-6 text-center relative">
      <div className="container mx-auto">
        <div className="text-xs md:text-sm font-semibold text-text-muted tracking-widest uppercase mb-2">
          Frontend Interview Preparation
        </div>
        <h1 className="font-extrabold text-[2.5rem] tracking-tight text-text-primary mb-3">
          <span className="bg-gradient-to-r from-text-primary to-primary bg-clip-text text-transparent">
            Master Frontend Technical Interviews
          </span>
        </h1>
        <p className="text-text-muted max-w-3xl mx-auto mb-6 text-[1.05rem] leading-relaxed">
          A premium curated question and answer guide covering AI systems, UI/UX metrics, React architectures, Core
          JavaScript, and Next.js optimizations.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <div className="bg-white border border-border-custom rounded px-4 py-2 shadow-sm flex items-center gap-2">
            <i className="fas fa-circle-nodes text-primary"></i>
            <span className="text-text-muted font-semibold text-[0.9rem]">
              Categories: <strong className="text-text-primary font-bold">5</strong>
            </span>
          </div>
          <div className="bg-white border border-border-custom rounded px-4 py-2 shadow-sm flex items-center gap-2">
            <i className="fas fa-question-circle text-primary"></i>
            <span className="text-text-muted font-semibold text-[0.9rem]">
              Questions: <strong className="text-text-primary font-bold">{totalQuestions}</strong>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
