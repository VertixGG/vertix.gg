import { BrowserRouter, Routes, Route } from "react-router-dom";

import { withCommands } from "@zenflux/react-commander/with-commands";
import { QueryProvider } from "@zenflux/react-commander/query/provider";

import { AuthenticatedQueryClient } from "@vertix.gg/dashboard/src/lib/query-client";

import { ModulesQuery } from "@vertix.gg/dashboard/src/features/flow-editor/query/modules-query";

import { AuthProvider, ProtectedRoute, LoginPage, ServerSelectionPage } from "@vertix.gg/dashboard/src/features/auth";

import { AppLayout } from "@vertix.gg/dashboard/src/components/app-layout";
import { DashboardPage } from "@vertix.gg/dashboard/src/pages/dashboard-page";
import { InterfaceEditorPage } from "@vertix.gg/dashboard/src/pages/interface-editor-page";
import { ManagementPage } from "@vertix.gg/dashboard/src/pages/management-page";

import { API_CONFIG } from "@vertix.gg/dashboard/src/lib/config";

interface AppState {
}

const client = new AuthenticatedQueryClient( API_CONFIG.BASE_URL );

client.registerModule( ModulesQuery );

export function App() {
    return (
        <QueryProvider client={ client }>
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={ <LoginPage /> } />

                        <Route path="/select-server" element={
                            <ProtectedRoute requireGuild={ false }>
                                <ServerSelectionPage />
                            </ProtectedRoute>
                        } />

                        <Route element={
                            <ProtectedRoute>
                                <AppLayout />
                            </ProtectedRoute>
                        }>
                            <Route path="/" element={ <DashboardPage /> } />
                            <Route path="/interface-editor" element={ <InterfaceEditorPage /> } />
                            <Route path="/management" element={ <ManagementPage /> } />
                        </Route>
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </QueryProvider>
    );
}

const $$ = withCommands<object, AppState>( "Dashboard/App", App, {
}, [] );

export default $$;
