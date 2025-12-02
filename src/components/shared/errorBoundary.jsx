// src/components/shared/errorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log everything to console
    console.group('🚨 ERROR CAUGHT BY BOUNDARY');
    console.error('Error:', error);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();

    // Save to state for display
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full">
            <div className="flex items-start gap-3 mb-6">
              <div className="flex-shrink-0">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-red-600 mb-2">
                  Something went wrong
                </h2>
                <p className="text-gray-600">
                  An error occurred while rendering the page. Please check the
                  console for details.
                </p>
              </div>
            </div>

            {/* Error Message */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Error Message:
              </h3>
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <code className="text-red-800 text-sm">
                  {this.state.error && this.state.error.toString()}
                </code>
              </div>
            </div>

            {/* Component Stack - THIS IS THE IMPORTANT PART! */}
            {this.state.errorInfo && (
              <details className="mb-4">
                <summary className="cursor-pointer font-semibold text-gray-900 mb-2 hover:text-blue-600">
                  📍 Component Stack (Click to see where the error happened)
                </summary>
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-2 overflow-auto">
                  <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}

            {/* Error Stack */}
            {this.state.error && this.state.error.stack && (
              <details className="mb-6">
                <summary className="cursor-pointer font-semibold text-gray-900 mb-2 hover:text-blue-600">
                  🔍 Full Error Stack
                </summary>
                <div className="bg-gray-50 border border-gray-200 rounded p-3 mt-2 overflow-auto">
                  <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.history.back()}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Go Back
              </button>
            </div>

            {/* Development Hint */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                <strong>💡 Developer Tip:</strong> Look at the "Component Stack"
                above. The error is happening in one of those components. Search
                for any place where you're trying to render an object directly:{' '}
                <code className="bg-blue-100 px-1 rounded">
                  {'{'} object {'}'}
                </code>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
