import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { GeneratorsCommandBase } from "./base";

import { GuildGeneratorsQuery } from "@vertix.gg/dashboard/src/features/generators/query/guild-generators-query";

import type { CreateDynamicSetupInput } from "@vertix.gg/dashboard/src/features/generators/types";

export class CreateDynamicSetupCommand extends GeneratorsCommandBase<{ input: CreateDynamicSetupInput }> {
    public static getName(): string {
        return "Dashboard/Generators/CreateDynamicSetup";
    }

    protected async run( args: { input: CreateDynamicSetupInput } ) {
        const initialCount = this.generatorsDetails?.dynamicMasterChannels.length ?? 0;

        this.setState( {
            isCreating: true,
            error: null
        } );

        try {
            const queryModule = getQueryModule( GuildGeneratorsQuery );

            await queryModule.request( "Dashboard/Generators/CreateDynamicSetup", {
                guildId: this.guildId,
                ...args.input
            } );

            // Poll for setup completion
            const updatedDetails = await this.pollForSetupCompletion( "dynamic", initialCount );

            return this.setState( {
                generatorsDetails: updatedDetails ?? this.generatorsDetails,
                isCreating: false,
                showCreateModal: false,
                createModalType: null
            } );
        } catch( error ) {
            // The form closes on the way out. What went wrong is said over the page rather than
            // behind the form that asked for it, and a form left standing over its own refusal
            // reads as though it is still waiting to be filled in differently.
            return this.setState( {
                error: error instanceof Error ? error.message : "Failed to create dynamic setup",
                isCreating: false,
                showCreateModal: false,
                createModalType: null
            } );
        }
    }
}
