"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <span className="text-4xl mb-4">💥</span>
          <h2 className="text-lg font-mono text-zinc-300 mb-2">Something crashed</h2>
          <p className="text-sm font-mono text-zinc-600 mb-4 max-w-md">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-4 py-2 text-sm font-mono text-zinc-400 border border-zinc-800 rounded-lg hover:text-zinc-200 hover:border-zinc-700 transition"
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
