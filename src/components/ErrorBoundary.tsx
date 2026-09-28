import React from "react";
import { AlertTriangle } from "lucide-react";

interface Props { children: React.ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-900 min-h-screen flex flex-col items-center justify-center">
          <AlertTriangle size={48} className="mb-4 text-red-500" />
          <h1 className="text-xl font-bold mb-2">Something went wrong.</h1>
          <pre className="text-xs bg-red-100 p-4 rounded-lg overflow-auto max-w-full">
            {this.state.error?.toString()}
          </pre>
          <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg">
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
