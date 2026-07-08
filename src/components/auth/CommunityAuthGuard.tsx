'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import { showToast } from '../../features/ui/uiSlice';
import { fetchMe } from '../../features/auth/authSlice';

interface CommunityAuthGuardProps {
  children: React.ReactNode;
}

export const CommunityAuthGuard: React.FC<CommunityAuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  
  const { isAuthenticated, isInitialized, isLoading } = useAppSelector((state) => state.auth);
  const [hasTriggeredRedirect, setHasTriggeredRedirect] = useState(false);

  // Initialize session once on mount if not initialized
  useEffect(() => {
    if (!isInitialized) {
      dispatch(fetchMe());
    }
  }, [dispatch, isInitialized]);

  // Auth check and delayed redirect
  useEffect(() => {
    if (isInitialized && !isAuthenticated && !isLoading && !hasTriggeredRedirect) {
      setHasTriggeredRedirect(true);
      dispatch(showToast('Please login to contribute to the community.'));
      
      const timer = setTimeout(() => {
        const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
        router.push(loginUrl);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isInitialized, isAuthenticated, isLoading, hasTriggeredRedirect, dispatch, pathname, router]);

  // If loading or initializing the session, show a clean, responsive loading state
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-[60vh] bg-body flex flex-col items-center justify-center py-20 px-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-text-secondary font-medium mt-4 text-sm md:text-base animate-pulse">
          Verifying authorization session...
        </p>
      </div>
    );
  }

  // If not authenticated, prevent access by returning a redirection message/spinner
  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] bg-body flex flex-col items-center justify-center py-20 px-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-text-secondary font-medium mt-4 text-sm md:text-base">
          Please login to contribute to the community. Redirecting...
        </p>
      </div>
    );
  }

  // Render content if authenticated
  return <>{children}</>;
};
