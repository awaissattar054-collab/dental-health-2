import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Terminal } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });
    console.group('DentAI Production Error');
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-6 font-sans">
          <div className="max-w-2xl w-full glass-card p-8 border-rose-500/20 bg-rose-500/5">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="text-rose-500 w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">System Runtime Error</h1>
                <p className="text-secondary text-sm">A fatal error occurred during DentAI initialization.</p>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-6 mb-8 border border-border">
              <div className="flex items-center gap-2 mb-4 text-rose-400">
                <Terminal className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Error Stack Trace</span>
              </div>
              <pre className="text-xs font-mono text-rose-300/80 overflow-auto max-h-[300px] leading-relaxed">
                {this.state.error?.toString()}
                {"\n\n"}
                {this.state.errorInfo?.componentStack}
              </pre>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 flex items-center justify-center gap-3 py-3 px-6 bg-accent text-white rounded-xl font-bold hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-accent/20"
              >
                <RefreshCw className="w-4 h-4" />
                Restart Application
              </button>
              <button
                onClick={() => window.history.back()}
                className="flex-1 py-3 px-6 bg-slate-800 text-secondary rounded-xl font-bold hover:bg-slate-700 transition-all"
              >
                Go Back
              </button>
            </div>
            
            <p className="text-[10px] text-secondary/40 text-center mt-8 uppercase tracking-[0.2em] font-bold">
              DentalOS Kernel Diagnostic v3.1.2
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
