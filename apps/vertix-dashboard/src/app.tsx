import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { withCommands } from "@zenflux/react-commander/with-commands";
import { QueryProvider } from "@zenflux/react-commander/query/provider";

import { AuthenticatedQueryClient } from "@vertix.gg/dashboard/src/lib/query-client";

import { ModulesQuery } from "@vertix.gg/dashboard/src/features/flow-editor/query/modules-query";
import { CustomizationQuery } from "@vertix.gg/dashboard/src/features/flow-editor/query/customization-query";
import { LanguageQuery } from "@vertix.gg/dashboard/src/features/flow-editor/query/language-query";
import { GlobalStatsQuery } from "@vertix.gg/dashboard/src/features/home/query/global-stats-query";
import { GuildStatsQuery } from "@vertix.gg/dashboard/src/features/home/query/guild-stats-query";
import { GuildDetailsQuery } from "@vertix.gg/dashboard/src/features/home/query/guild-details-query";
import { GuildGeneratorsQuery } from "@vertix.gg/dashboard/src/features/generators/query/guild-generators-query";
import { ServerConfigQuery } from "@vertix.gg/dashboard/src/features/server-config/query/server-config-query";

import { AuthProvider, ProtectedRoute, LoginPage, ServerSelectionPage } from "@vertix.gg/dashboard/src/features/auth";

import { AppLayout } from "@vertix.gg/dashboard/src/components/app-layout";
import { HomePage } from "@vertix.gg/dashboard/src/pages/home-page";
import { InterfaceEditorPage } from "@vertix.gg/dashboard/src/pages/interface-editor-page";
import { GeneratorsPage } from "@vertix.gg/dashboard/src/pages/generators-page";
import { ServerConfigPage } from "@vertix.gg/dashboard/src/pages/server-config-page";

import { API_CONFIG } from "@vertix.gg/dashboard/src/lib/config";

interface AppState {
}

const client = new AuthenticatedQueryClient( API_CONFIG.BASE_URL );

client.registerModule( ModulesQuery );
client.registerModule( CustomizationQuery );
client.registerModule( LanguageQuery );
client.registerModule( GlobalStatsQuery );
client.registerModule( GuildStatsQuery );
client.registerModule( GuildDetailsQuery );
client.registerModule( GuildGeneratorsQuery );
client.registerModule( ServerConfigQuery );

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
                            <Route path="/" element={ <HomePage /> } />
                            <Route path="/interface-editor" element={ <InterfaceEditorPage /> } />
                            <Route path="/generators" element={ <GeneratorsPage /> } />
                            <Route path="/server-config" element={ <ServerConfigPage /> } />

                            { /* The page was called Management until it was named after what it
                                 actually holds. */ }
                            <Route path="/management" element={ <Navigate to="/generators" replace /> } />
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
