'use client';

import React, { useState, useEffect } from 'react';

export const ScrollToTop: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShow(true);
      } else {
        setShow(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={handleClick}
      className={`fixed bottom-[30px] right-[30px] w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer z-50 shadow-[0_4px_12px_rgba(79,70,229,0.3)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-[#4338ca] hover:-translate-y-1 hover:shadow-[0_6px_16px_rgba(79,70,229,0.4)] border-0 ${
        show ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-2.5 invisible'
      }`}
      title="Go to top"
      aria-label="Scroll back to top"
    >
      <i className="fas fa-arrow-up"></i>
    </button>
  );
};
