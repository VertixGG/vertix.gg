import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { GeneratorsCommandBase } from "./base";

import { GuildGeneratorsQuery } from "@vertix.gg/dashboard/src/features/generators/query/guild-generators-query";

import type { DynamicMasterDetails, DynamicSettings } from "@vertix.gg/dashboard/src/features/generators/types";

export class UpdateDynamicSettingsCommand extends GeneratorsCommandBase<{
    masterChannelId: string;
    settings: Partial<DynamicSettings>;
}> {
    public static getName(): string {
        return "Dashboard/Generators/UpdateDynamicSettings";
    }

    protected async run( args: {
        masterChannelId: string;
        settings: Partial<DynamicSettings>;
    } ) {
        const generatorsDetails = this.generatorsDetails;

        if ( !generatorsDetails ) {
            return this.setState( { error: "No generator details loaded" } );
        }

        this.setState( {
            isSaving: true,
            error: null
        } );

        try {
            const queryModule = getQueryModule( GuildGeneratorsQuery );

            await queryModule.request( "Dashboard/Generators/UpdateDynamicSettings", {
                guildId: this.guildId,
                masterChannelId: args.masterChannelId,
                ...args.settings
            } );

            // Reload the dynamic master details
            const data = await queryModule.request<DynamicMasterDetails>( "Dashboard/Generators/GetDynamicDetails", {
                guildId: this.guildId,
                masterChannelId: args.masterChannelId
            } );

            const updatedDynamicMasters = generatorsDetails.dynamicMasterChannels.map( ( master ) =>
                master.id === args.masterChannelId
                    ? { ...master, ...data.master, dynamicChannels: data.dynamicChannels, discord: data.discord }
                    : master
            );

            return this.setState( {
                generatorsDetails: { ...generatorsDetails, dynamicMasterChannels: updatedDynamicMasters },
                isSaving: false
            } );
        } catch( error ) {
            return this.setState( {
                error: error instanceof Error ? error.message : "Failed to update dynamic settings",
                isSaving: false
            } );
        }
    }
}
