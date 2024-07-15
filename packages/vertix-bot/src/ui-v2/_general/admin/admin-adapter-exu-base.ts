import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { ChannelType, PermissionsBitField } from "discord.js";

import { Logger } from "@vertix.gg/base/src/modules/logger";

import { UIAdapterExecutionStepsBase } from "@vertix.gg/gui/src/bases/ui-adapter-execution-steps-base";

import { PermissionsManager } from "@vertix.gg/bot/src/managers/permissions-manager";

import {
    DEFAULT_MASTER_CHANNEL_SETUP_PERMISSIONS,
    DEFAULT_SETUP_PERMISSIONS
} from "@vertix.gg/bot/src/definitions/master-channel";

import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { UIAdapterReplyContext, UIAdapterStartContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

export class AdminAdapterExuBase<
    TChannel extends UIAdapterStartContext,
    TInteraction extends UIAdapterReplyContext
> extends UIAdapterExecutionStepsBase<TChannel, TInteraction> {
    private static dedicatedLogger = new Logger( this.getName() );

    protected dynamicChannelService: DynamicChannelService;

    public static getName() {
        return "VertixBot/UI-V2/AdminAdapterExuBase";
    }

    public constructor( options: TAdapterRegisterOptions ) {
        super( options );

        this.dynamicChannelService = ServiceLocator.$.get( "VertixBot/Services/DynamicChannel" );
    }

    public getPermissions(): PermissionsBitField {
        return new PermissionsBitField( DEFAULT_SETUP_PERMISSIONS );
    }

    public getChannelTypes() {
        return [
            ChannelType.GuildVoice,
            ChannelType.GuildText,
        ];
    }

    public async isPassingInteractionRequirementsInternal( interaction: TInteraction ) {
        if ( ! PermissionsManager.$.isSelfAdministratorRole( interaction.guild ) ) {
            const botRolePermissions = PermissionsManager.$.getRolesPermissions( interaction.guild );
            const missingPermissions = botRolePermissions.missing( DEFAULT_MASTER_CHANNEL_SETUP_PERMISSIONS );

            if ( missingPermissions.length ) {
                AdminAdapterExuBase.dedicatedLogger.admin( this.run,
                    `🔐 Bot missing permissions" - "${ missingPermissions.join( ", " ) }" (${ interaction.guild.name }) (${ interaction.guild?.memberCount })`
                );

                await this.uiAdapterService.get( "VertixGUI/InternalAdapters/MissingPermissionsAdapter" )?.ephemeral( interaction, {
                    missingPermissions,
                    omitterDisplayName: interaction.guild.client.user.username,
                } );

                return false;
            }
        }

        return true;
    }
}
