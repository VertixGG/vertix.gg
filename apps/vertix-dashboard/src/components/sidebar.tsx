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
        <aside className="w-64 h-full bg-zinc-800 border-r border-zinc-700 flex flex-col">
            <div className="p-4 border-b border-zinc-700">
                <h1 className="text-xl font-bold text-white">Vertix Dashboard</h1>
            </div>

            <nav className="flex-1 p-2">
                { navItems.map( ( item ) => (
                    <NavLink
                        key={ item.path }
                        to={ item.path }
                        className={ ( { isActive } ) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                                isActive
                                    ? "bg-zinc-700 text-white"
                                    : "text-zinc-400 hover:bg-zinc-700/50 hover:text-white"
                            }`
                        }
                    >
                        { item.icon }
                        <span>{ item.label }</span>
                    </NavLink>
                ) ) }
            </nav>

            <div className="p-4 border-t border-zinc-700">
                <div className="flex flex-col items-center gap-3 mb-4">
                    { user?.avatar ? (
                        <img
                            src={ user.avatar }
                            alt={ user.displayName }
                            className="w-16 h-16 rounded-full"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-zinc-700 flex items-center justify-center">
                            <User className="w-8 h-8 text-zinc-400" />
                        </div>
                    ) }
                    <span className="text-white font-medium">{ user?.displayName || "User" }</span>
                    <button
                        onClick={ handleSwitchServer }
                        className="flex items-center gap-2 text-zinc-400 text-sm hover:text-zinc-200 transition-colors cursor-pointer"
                    >
                        <span>Server <code className="bg-zinc-700 px-1.5 py-0.5 rounded text-zinc-300">{ selectedGuild?.name || "None" }</code></span>
                        <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={ handleLogout }
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-zinc-300 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-zinc-300 transition-colors">
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
