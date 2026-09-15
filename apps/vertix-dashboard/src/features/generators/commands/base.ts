import { CommandBase } from "@zenflux/react-commander/command-base";

import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { GuildGeneratorsQuery } from "@vertix.gg/dashboard/src/features/generators/query/guild-generators-query";

import type { DCommandArgs } from "@zenflux/react-commander/definitions";

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
    /**
     * A refresh of what is already on screen, as opposed to `isLoading`, which is a load with
     * nothing to show yet. The panel stays up and only its refresh control reacts - swapping it
     * for a spinner every time the poll runs reads as the page reloading itself.
     */
    isRefreshing: boolean;
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
    isRefreshing: false,
    error: null,
    lastRefreshTimestamp: 0,
    showCreateModal: false,
    createModalType: null
};

/**
 * Base command for generators commands that require a guild ID.
 * Automatically validates guildId before executing the command.
 */
/**
 * A generators command, with the guild checked before it runs.
 *
 * The default arguments are the registry's own rather than `void`. A command declared as taking
 * nothing is not one that takes the registry's arguments - contravariantly it is the opposite -
 * so the three that declare none could not be registered alongside the ones that do, which the
 * registry only tolerated because nothing was checking. They are called with `{}` regardless.
 */
export abstract class GeneratorsCommandBase<TArgs extends DCommandArgs = DCommandArgs>
    extends CommandBase<GeneratorsState, TArgs> {
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

        return this.perform( args );
    }

    /**
     * What the command actually does, once there is a guild to do it to.
     *
     * Not `run` or `execute`: the library's bases declare both - a no argument `run()` and an
     * `execute( emitter, args, options )` - so a protected one of either name is a collision
     * rather than an override, and they were only ever compatible because nothing was checking.
     */
    protected abstract perform( args: TArgs ): unknown;

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
