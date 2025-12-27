import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import { DashboardMain } from "@vertix.gg/dashboard/src/components/dashboard-main";

createRoot( document.getElementById( "root" )! ).render(
    <StrictMode>
        <DashboardMain />
    </StrictMode>,
);
