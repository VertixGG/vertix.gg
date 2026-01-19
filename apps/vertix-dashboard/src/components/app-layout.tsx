import { Outlet } from "react-router-dom";

import { Sidebar } from "@vertix.gg/dashboard/src/components/sidebar";

export function AppLayout() {
    return (
        <div className="flex h-screen bg-background text-text-primary">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0">
                <Outlet />
            </main>
        </div>
    );
}
