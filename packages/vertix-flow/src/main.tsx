import React from "react";
import ReactDOM from "react-dom/client";
import { AlertCircle, RefreshCw } from "lucide-react";

import "@vertix.gg/flow/src/index.css";

import { FlowEditor } from "@vertix.gg/flow/src/features/flow-editor/flow-editor";
import { Alert, AlertDescription, AlertTitle } from "@vertix.gg/flow/src/shared/components/alert";
import { Button } from "@vertix.gg/flow/src/shared/components/button";
import { Card, CardContent } from "@vertix.gg/flow/src/shared/components/card";

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
        return { hasError: true, error };
    }

    public componentDidCatch( error: Error, errorInfo: ErrorInfo ) {
        console.error( "Uncaught error:", error, errorInfo );
    }

    public render() {
        if ( this.state.hasError ) {
            return (
                <div className="p-4 max-w-md mx-auto mt-10">
                    <Card>
                        <CardContent className="pt-6">
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Something went wrong</AlertTitle>
                                <AlertDescription>
                                    An error occurred in the application:
                                    <pre className="mt-2 p-2 bg-destructive/10 rounded text-xs overflow-auto max-h-40">
                                        {this.state.error?.message || "Unknown error"}
                                    </pre>
                                </AlertDescription>
                            </Alert>
                            <Button
                                onClick={() => window.location.reload()}
                                className="w-full mt-4"
                                variant="default"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reload Application
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

const rootElement = document.getElementById( "root" );

if ( rootElement ) {
    const root = ReactDOM.createRoot( rootElement );

    root.render(
        <React.StrictMode>
            <ErrorBoundary>
                <FlowEditor/>
            </ErrorBoundary>
        </React.StrictMode>
    );
}
