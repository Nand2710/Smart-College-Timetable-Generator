import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to an error reporting service
        console.error('Uncaught error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                    <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center">
                        <AlertTriangle className="mx-auto mb-4 text-red-500" size={64} />
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">
                            Something went wrong
                        </h2>
                        <p className="text-gray-600 mb-6">
                            An unexpected error occurred. Please try again or contact support.
                        </p>

                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-blue-500 text-white hover:bg-blue-600"
                            >
                                <RefreshCw className="mr-2" size={16} />
                                Reload Page
                            </button>

                            {this.props.fallbackUI && (
                                <button
                                    onClick={this.handleReset}
                                    className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                                >
                                    Go Back
                                </button>
                            )}
                        </div>

                        {/* Optional: Detailed error information for debugging */}
                        {this.state.error && (
                            <details className="mt-4 text-left text-sm text-gray-500">
                                <summary>Error Details</summary>
                                <pre>{this.state.error.toString()}</pre>
                                <pre>{this.state.errorInfo.componentStack}</pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        // Render children normally
        return this.props.children;
    }
}

export default ErrorBoundary;