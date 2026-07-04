'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 rounded-lg p-6 text-center my-4">
          <i className="fas fa-exclamation-triangle text-3xl mb-3 text-red-500"></i>
          <h4 className="text-lg font-bold">{this.props.fallbackTitle || 'Component Error'}</h4>
          <p className="text-sm text-text-secondary mt-1">
            Something went wrong while rendering this section.
          </p>
          <button
            onClick={this.handleReset}
            className="bg-primary text-white hover:bg-primary/95 text-xs font-semibold py-1.5 px-4 rounded mt-3 cursor-pointer border-0 shadow-sm"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
