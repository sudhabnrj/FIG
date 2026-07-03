'use client';

import React, { useEffect } from 'react';
import { useToast } from '../../hooks/useToast';

export const Toast: React.FC = () => {
  const { message, isShow, dismissToast } = useToast();

  useEffect(() => {
    if (isShow) {
      const timer = setTimeout(() => {
        dismissToast();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isShow, dismissToast]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1090] pointer-events-none">
      <div
        className={`bg-[#0f172a] text-white rounded-[30px] px-6 py-2.5 text-sm font-medium shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2)] flex items-center gap-2 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isShow ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
      >
        <i className="fas fa-check-circle text-success"></i>
        <span>{message}</span>
      </div>
    </div>
  );
};
