import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console and any error reporting service
    console.error('🚨 Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  // Check if error is server-related
  private isServerError = (error: Error): boolean => {
    const errorMessage = error.message.toLowerCase();
    const errorString = error.toString().toLowerCase();
    
    return (
      errorMessage.includes('network error') ||
      errorMessage.includes('connection refused') ||
      errorMessage.includes('econnrefused') ||
      errorMessage.includes('err_network') ||
      errorMessage.includes('fetch failed') ||
      errorMessage.includes('server is down') ||
      errorString.includes('network error') ||
      errorString.includes('connection refused') ||
      errorString.includes('econnrefused') ||
      errorString.includes('err_network') ||
      errorString.includes('fetch failed')
    );
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              {this.state.error && this.isServerError(this.state.error) 
                ? 'Server is currently down' 
                : 'Something went wrong'
              }
            </h1>
            
            <p className="text-gray-600 mb-6">
              {this.state.error && this.isServerError(this.state.error) ? (
                <>
                  We're unable to connect to our servers. This could be due to maintenance or a temporary outage. 
                  Please try again in a few minutes or contact support if the problem persists.
                </>
              ) : (
                <>
                  We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
                </>
              )}
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
                <h3 className="font-medium text-gray-900 mb-2">Error Details:</h3>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-auto max-h-32">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-800">
                      Component Stack
                    </summary>
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-auto max-h-32 mt-1">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
              
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Home size={16} />
                Reload Page
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              If this problem continues, please contact support with the error details above.
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Hook for error boundary context (if needed)
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('🚨 Error caught by useErrorHandler:', error, errorInfo);
    // You can add additional error reporting logic here
  };
};
