import { CommandBase } from "@zenflux/react-commander/command-base";

import {
    fetchCurrentUser,
    fetchGuilds,
    selectGuild as selectGuildApi,
    logout as logoutApi
} from "@vertix.gg/dashboard/src/features/auth/api";

import { useSelectedGuildStore } from "@vertix.gg/dashboard/src/hooks/use-selected-guild";

import type { AuthUser, Guild, SelectedGuild } from "@vertix.gg/dashboard/src/features/auth/types";

export interface AuthState {
    user: AuthUser | null;
    guilds: Guild[];
    selectedGuild: SelectedGuild | null;
    isLoading: boolean;
    isLoadingGuilds: boolean;
    isAuthenticated: boolean;
    isOwner: boolean;
    error: string | null;
}

export const AUTH_INITIAL_STATE: AuthState = {
    user: null,
    guilds: [],
    selectedGuild: null,
    isLoading: true,
    isLoadingGuilds: false,
    isAuthenticated: false,
    isOwner: false,
    error: null
};

export class CheckAuthCommand extends CommandBase<AuthState> {
    public static getName(): string {
        return "Dashboard/Auth/CheckAuth";
    }

    public async apply() {
        this.setState( { isLoading: true, error: null } );

        try {
            const data = await fetchCurrentUser();

            // Sync selected guild to zustand store for cross-context access
            useSelectedGuildStore.getState().setSelectedGuild( data?.selectedGuild || null );

            return this.setState( {
                user: data?.user || null,
                selectedGuild: data?.selectedGuild || null,
                isAuthenticated: !!data?.user,
                isOwner: data?.isOwner ?? false,
                isLoading: false
            } );
        } catch {
            useSelectedGuildStore.getState().setSelectedGuild( null );

            return this.setState( {
                user: null,
                selectedGuild: null,
                isAuthenticated: false,
                isOwner: false,
                isLoading: false,
                error: "Failed to check authentication"
            } );
        }
    }
}

export class FetchGuildsCommand extends CommandBase<AuthState> {
    public static getName(): string {
        return "Dashboard/Auth/FetchGuilds";
    }

    public async apply() {
        this.setState( { isLoadingGuilds: true, error: null } );

        try {
            const guilds = await fetchGuilds();

            return this.setState( {
                guilds,
                isLoadingGuilds: false
            } );
        } catch {
            return this.setState( {
                guilds: [],
                isLoadingGuilds: false,
                error: "Failed to fetch guilds"
            } );
        }
    }
}

export class SelectGuildCommand extends CommandBase<AuthState, { guild: Guild }> {
    public static getName(): string {
        return "Dashboard/Auth/SelectGuild";
    }

    public async apply( args: { guild: Guild } ) {
        try {
            const selectedGuild = await selectGuildApi( args.guild );

            // Sync to zustand store
            useSelectedGuildStore.getState().setSelectedGuild( selectedGuild );

            return this.setState( { selectedGuild } );
        } catch {
            return this.setState( { error: "Failed to select guild" } );
        }
    }
}

export class LogoutCommand extends CommandBase<AuthState> {
    public static getName(): string {
        return "Dashboard/Auth/Logout";
    }

    public async apply() {
        try {
            await logoutApi();

            // Clear zustand store
            useSelectedGuildStore.getState().setSelectedGuild( null );

            return this.setState( {
                user: null,
                guilds: [],
                selectedGuild: null,
                isAuthenticated: false,
                isOwner: false
            } );
        } catch {
            return this.setState( { error: "Failed to logout" } );
        }
    }
}

export class ClearSelectedGuildCommand extends CommandBase<AuthState> {
    public static getName(): string {
        return "Dashboard/Auth/ClearSelectedGuild";
    }

    public apply() {
        // Clear zustand store
        useSelectedGuildStore.getState().setSelectedGuild( null );

        return this.setState( { selectedGuild: null } );
    }
}

export class ClearAuthErrorCommand extends CommandBase<AuthState> {
    public static getName(): string {
        return "Dashboard/Auth/ClearError";
    }

    public apply() {
        return this.setState( { error: null } );
    }
}
