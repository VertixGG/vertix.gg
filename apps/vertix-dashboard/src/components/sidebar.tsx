import { NavLink, useNavigate } from "react-router-dom";

import { useCommandState, useCommand } from "@zenflux/react-commander/hooks";

import { LayoutDashboard, Boxes, Settings, LogOut, User, ChevronUp } from "lucide-react";

import type { AuthState } from "@vertix.gg/dashboard/src/features/auth/commands/auth-commands";

interface NavItem {
    label: string;
    path: string;
    icon: React.ReactNode;
}

interface SidebarSelectedState {
    user: AuthState[ "user" ];
    selectedGuild: AuthState[ "selectedGuild" ];
}

const navItems: NavItem[] = [
    {
        label: "Dashboard",
        path: "/",
        icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
        label: "Interface Editor",
        path: "/interface-editor",
        icon: <Boxes className="w-5 h-5" />
    },
    {
        label: "Management",
        path: "/management",
        icon: <Settings className="w-5 h-5" />
    }
];

export function Sidebar() {
    const navigate = useNavigate();

    const [ state ] = useCommandState<AuthState, SidebarSelectedState>(
        "Dashboard/Auth",
        ( state: AuthState ): SidebarSelectedState => ( {
            user: state.user,
            selectedGuild: state.selectedGuild
        } )
    );

    const logoutCommand = useCommand( "Dashboard/Auth/Logout" );
    const clearSelectedGuildCommand = useCommand( "Dashboard/Auth/ClearSelectedGuild" );

    const handleLogout = async () => {
        await logoutCommand.run( {} );
        navigate( "/login" );
    };

    const handleSwitchServer = () => {
        clearSelectedGuildCommand.run( {} );
        navigate( "/select-server" );
    };

    const user = state.user;
    const selectedGuild = state.selectedGuild;

    return (
        <aside className="w-64 h-full bg-surface border-r border-border flex flex-col">
            <div className="p-4 border-b border-border flex items-center gap-3">
                <img src="/robot.png" alt="Robot" className="w-8 h-8" />
                <h1 className="text-xl font-bold text-text-accent">Dashboard</h1>
            </div>

            <nav className="flex-1 p-2">
                { navItems.map( ( item ) => (
                    <NavLink
                        key={ item.path }
                        to={ item.path }
                        className={ ( { isActive } ) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                                isActive
                                    ? "bg-surface-elevated text-text-accent border border-border-accent"
                                    : "text-text-muted hover:bg-surface-hover hover:text-text-primary"
                            }`
                        }
                    >
                        { item.icon }
                        <span>{ item.label }</span>
                    </NavLink>
                ) ) }
            </nav>

            <div className="p-4 border-t border-border">
                <div className="flex flex-col items-center gap-3 mb-4">
                    { user?.avatar ? (
                        <img
                            src={ user.avatar }
                            alt={ user.displayName }
                            className="w-16 h-16 rounded-full ring-2 ring-border-accent"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-surface-elevated flex items-center justify-center">
                            <User className="w-8 h-8 text-text-muted" />
                        </div>
                    ) }
                    <span className="text-text-primary font-medium">{ user?.displayName || "User" }</span>
                    <button
                        onClick={ handleSwitchServer }
                        className="flex items-center gap-2 text-text-muted text-sm hover:text-text-accent transition-colors cursor-pointer"
                    >
                        <span>Server <code className="bg-surface-elevated px-1.5 py-0.5 rounded text-text-accent">{ selectedGuild?.name || "None" }</code></span>
                        <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={ handleLogout }
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-surface-elevated hover:bg-surface-hover rounded-lg text-text-secondary hover:text-text-accent transition-colors border border-border hover:border-border-accent"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-surface-elevated hover:bg-surface-hover rounded-lg text-text-secondary hover:text-text-accent transition-colors border border-border hover:border-border-accent">
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
