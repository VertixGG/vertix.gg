import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { GeneratorsCommandBase } from "./base";

import { GuildGeneratorsQuery } from "@vertix.gg/dashboard/src/features/generators/query/guild-generators-query";

import type { CreateScalingSetupInput } from "@vertix.gg/dashboard/src/features/generators/types";

export class CreateScalingSetupCommand extends GeneratorsCommandBase<{ input: CreateScalingSetupInput }> {
    public static getName(): string {
        return "Dashboard/Generators/CreateScalingSetup";
    }

    protected async run( args: { input: CreateScalingSetupInput } ) {
        const initialCount = this.generatorsDetails?.scalingMasterChannels.length ?? 0;

        this.setState( {
            isCreating: true,
            error: null
        } );

        try {
            const queryModule = getQueryModule( GuildGeneratorsQuery );

            await queryModule.request( "Dashboard/Generators/CreateScalingSetup", {
                guildId: this.guildId,
                ...args.input
            } );

            // Poll for setup completion
            const updatedDetails = await this.pollForSetupCompletion( "scaling", initialCount );

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
                error: error instanceof Error ? error.message : "Failed to create scaling setup",
                isCreating: false,
                showCreateModal: false,
                createModalType: null
            } );
        }
    }
}
