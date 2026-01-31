import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { ManagementCommandBase } from "./base";

import { GuildManagementQuery } from "@vertix.gg/dashboard/src/features/management/query/guild-management-query";

import type { DynamicMasterDetails } from "@vertix.gg/dashboard/src/features/management/types";

export class UpdateDynamicSettingsCommand extends ManagementCommandBase<{
    masterChannelId: string;
    settings: {
        dynamicChannelNameTemplate?: string;
        dynamicChannelAutoSave?: boolean;
        dynamicChannelMentionable?: boolean;
    };
}> {
    public static getName(): string {
        return "Dashboard/Management/UpdateDynamicSettings";
    }

    protected async run( args: {
        masterChannelId: string;
        settings: {
            dynamicChannelNameTemplate?: string;
            dynamicChannelAutoSave?: boolean;
            dynamicChannelMentionable?: boolean;
        };
    } ) {
        const managementDetails = this.managementDetails;

        if ( !managementDetails ) {
            return this.setState( { error: "No management details loaded" } );
        }

        this.setState( {
            isSaving: true,
            error: null
        } );

        try {
            const queryModule = getQueryModule( GuildManagementQuery );

            await queryModule.request( "Dashboard/Management/UpdateDynamicSettings", {
                guildId: this.guildId,
                masterChannelId: args.masterChannelId,
                ...args.settings
            } );

            // Reload the dynamic master details
            const data = await queryModule.request<DynamicMasterDetails>( "Dashboard/Management/GetDynamicDetails", {
                guildId: this.guildId,
                masterChannelId: args.masterChannelId
            } );

            const updatedDynamicMasters = managementDetails.dynamicMasterChannels.map( ( master ) =>
                master.id === args.masterChannelId
                    ? { ...master, ...data.master, dynamicChannels: data.dynamicChannels, discord: data.discord }
                    : master
            );

            return this.setState( {
                managementDetails: { ...managementDetails, dynamicMasterChannels: updatedDynamicMasters },
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
