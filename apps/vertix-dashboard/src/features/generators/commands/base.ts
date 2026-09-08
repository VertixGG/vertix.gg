import { CommandBase } from "@zenflux/react-commander/command-base";
import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { GuildGeneratorsQuery } from "@vertix.gg/dashboard/src/features/generators/query/guild-generators-query";

import type {
    GuildGeneratorsDetails,
    GuildDiscordOptions,
    MasterChannelType
} from "@vertix.gg/dashboard/src/features/generators/types";

export type CreateModalType = "scaling" | "dynamic" | null;

export interface GeneratorsState {
    guildId: string | null;
    generatorsDetails: GuildGeneratorsDetails | null;
    /** The roles and channels the settings forms offer; null until the guild is loaded. */
    discordOptions: GuildDiscordOptions | null;
    selectedMasterChannelId: string | null;
    selectedMasterChannelType: MasterChannelType | null;
    isSaving: boolean;
    isCreating: boolean;
    isLoading: boolean;
    error: string | null;
    lastRefreshTimestamp: number;
    showCreateModal: boolean;
    createModalType: CreateModalType;
}

export const GENERATORS_INITIAL_STATE: GeneratorsState = {
    guildId: null,
    generatorsDetails: null,
    discordOptions: null,
    selectedMasterChannelId: null,
    selectedMasterChannelType: null,
    isSaving: false,
    isCreating: false,
    isLoading: false,
    error: null,
    lastRefreshTimestamp: 0,
    showCreateModal: false,
    createModalType: null
};

/**
 * Base command for generators commands that require a guild ID.
 * Automatically validates guildId before executing the command.
 */
export abstract class GeneratorsCommandBase<TArgs = void> extends CommandBase<GeneratorsState, TArgs> {
    protected get guildId(): string {
        return this.state.guildId!;
    }

    protected get generatorsDetails(): GuildGeneratorsDetails | null {
        return this.state.generatorsDetails;
    }

    public apply( args: TArgs ) {
        if ( !this.state.guildId ) {
            return this.setState( { error: "No guild selected" } );
        }

        return this.run( args );
    }

    protected abstract run( args: TArgs ): unknown;

    protected async pollForSetupCompletion(
        type: "scaling" | "dynamic",
        initialCount: number,
        maxAttempts = 10,
        intervalMs = 500
    ): Promise<GuildGeneratorsDetails | null> {
        const queryModule = getQueryModule( GuildGeneratorsQuery );

        for ( let attempt = 0; attempt < maxAttempts; attempt++ ) {
            await new Promise( ( resolve ) => setTimeout( resolve, intervalMs ) );

            try {
                const data = await queryModule.request<GuildGeneratorsDetails>( "Dashboard/Generators", {
                    guildId: this.guildId
                } );

                const currentCount = type === "scaling"
                    ? data.scalingMasterChannels.length
                    : data.dynamicMasterChannels.length;

                if ( currentCount > initialCount ) {
                    return data;
                }
            } catch {
                // Continue polling on error
            }
        }

        return null;
    }
}
