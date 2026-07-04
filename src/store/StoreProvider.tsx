'use client';

import React, { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from './appStore';
import { Question } from '../types';

interface StoreProviderProps {
  children: React.ReactNode;
  initialQuestions?: Question[];
}

export default function StoreProvider({ children, initialQuestions }: StoreProviderProps) {
  const storeRef = useRef<AppStore | null>(null);
  
  if (!storeRef.current) {
    // Populate the initial state of the questions slice on initial server and client render
    const preloadedState = initialQuestions
      ? {
          questions: {
            questions: initialQuestions,
            isLoading: false,
            error: null,
            expandedCards: [],
          },
        }
      : undefined;
      
    storeRef.current = makeStore(preloadedState);
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
