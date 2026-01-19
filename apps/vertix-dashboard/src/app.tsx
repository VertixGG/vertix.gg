import { BrowserRouter, Routes, Route } from "react-router-dom";

import { withCommands } from "@zenflux/react-commander/with-commands";
import { QueryClient } from "@zenflux/react-commander/query/client";
import { QueryProvider } from "@zenflux/react-commander/query/provider";

import { ModulesQuery } from "@vertix.gg/dashboard/src/features/flow-editor/query/modules-query";

import { AppLayout } from "@vertix.gg/dashboard/src/components/app-layout";
import { DashboardPage } from "@vertix.gg/dashboard/src/pages/dashboard-page";
import { InterfaceEditorPage } from "@vertix.gg/dashboard/src/pages/interface-editor-page";
import { ManagementPage } from "@vertix.gg/dashboard/src/pages/management-page";

import { API_CONFIG } from "@vertix.gg/dashboard/src/lib/config";

interface AppState {
}

const client = new QueryClient( API_CONFIG.BASE_URL );

client.registerModule( ModulesQuery );

export function App() {
    return (
        <QueryProvider client={ client }>
            <BrowserRouter>
                <Routes>
                    <Route element={ <AppLayout /> }>
                        <Route path="/" element={ <DashboardPage /> } />
                        <Route path="/interface-editor" element={ <InterfaceEditorPage /> } />
                        <Route path="/management" element={ <ManagementPage /> } />
                    </Route>
                </Routes>
            </BrowserRouter>
        </QueryProvider>
    );
}

const $$ = withCommands<object, AppState>( "Dashboard/App", App, {
}, [] );

export default $$;
