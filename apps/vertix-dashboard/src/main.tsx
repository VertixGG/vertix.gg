import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";

import { AppLayout } from "@vertix.gg/dashboard/src/components/app-layout";
import { DashboardPage } from "@vertix.gg/dashboard/src/pages/dashboard-page";
import { InterfaceEditorPage } from "@vertix.gg/dashboard/src/pages/interface-editor-page";
import { ManagementPage } from "@vertix.gg/dashboard/src/pages/management-page";

createRoot( document.getElementById( "root" )! ).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route element={ <AppLayout /> }>
                    <Route path="/" element={ <DashboardPage /> } />
                    <Route path="/interface-editor" element={ <InterfaceEditorPage /> } />
                    <Route path="/management" element={ <ManagementPage /> } />
                </Route>
            </Routes>
        </BrowserRouter>
    </StrictMode>,
);
