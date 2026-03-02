"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Optional fallback UI. Default: simple message + reload. */
  fallback?: ReactNode;
  /** Optional callback when error is caught. */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Client-side error boundary. Catches runtime errors in child tree
 * and renders fallback so the app does not white-screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          className="min-h-[200px] flex flex-col items-center justify-center p-6 bg-[hsl(var(--surface-1))] border border-[hsl(var(--border))] rounded-lg"
          role="alert"
        >
          <p className="text-[15px] font-medium text-[hsl(var(--text-primary))]">
            Something went wrong
          </p>
          <p className="text-[13px] text-[hsl(var(--text-muted))] mt-1 max-w-md text-center">
            {this.state.error.message}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 text-[13px] font-medium rounded-md bg-[hsl(var(--text-primary))] text-[hsl(var(--surface-1))] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
