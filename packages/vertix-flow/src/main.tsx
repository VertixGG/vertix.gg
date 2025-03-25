import React from "react";
import ReactDOM from "react-dom/client";

import "@vertix.gg/flow/src/index.css";
import { FlowEditor } from "@vertix.gg/flow/src/features/flow-editor/flow-editor";

import type { ErrorInfo, ReactNode } from "react";

// Error boundary to catch any unhandled errors
class ErrorBoundary extends React.Component<
        { children: ReactNode },
        { hasError: boolean; error?: Error }
> {
    public constructor( props: { children: ReactNode } ) {
        super( props );
        this.state = { hasError: false };
    }

    public static getDerivedStateFromError( error: Error ) {
        // Update state so the next render shows the fallback UI
        return { hasError: true, error };
    }

    public componentDidCatch( error: Error, errorInfo: ErrorInfo ) {
        // You can log the error to an error reporting service
        console.error( "Uncaught error:", error, errorInfo );
    }

    public render() {
        if ( this.state.hasError ) {
            // You can render any custom fallback UI
            return (
                <div className="p-4 max-w-md mx-auto mt-10 bg-red-50 border border-red-200 rounded-md">
                    <h1 className="text-xl font-bold text-red-700 mb-4">Something went wrong</h1>
                    <p className="text-sm text-red-600 mb-2">An error occurred in the application:</p>

                    <pre className="p-2 bg-red-100 rounded text-xs overflow-auto max-h-40">
                        { this.state.error?.toString() || "Unknown error" }
                    </pre>

                    <button
                            onClick={ () => window.location.reload() }
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

ReactDOM.createRoot( document.getElementById( "root" )! ).render(
    <React.StrictMode>
        <ErrorBoundary>
            <FlowEditor/>
        </ErrorBoundary>
    </React.StrictMode>
);
