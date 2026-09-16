import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { ChannelType, PermissionsBitField } from "discord.js";

import { Logger } from "@vertix.gg/base/src/modules/logger";

import { UIAdapterExecutionStepsBase } from "@vertix.gg/gui/src/bases/ui-adapter-execution-steps-base";

import { DEFAULT_SETUP_PERMISSIONS } from "@vertix.gg/bot/src/definitions/master-channel";

import { isPassingBotGuildPermissions } from "@vertix.gg/bot/src/ui/general/admin/bot-permissions-requirement";

import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { UIAdapterReplyContext, UIAdapterStartContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

export class AdminAdapterExuBase<
    TChannel extends UIAdapterStartContext,
    TInteraction extends UIAdapterReplyContext
> extends UIAdapterExecutionStepsBase<TChannel, TInteraction> {
    private static dedicatedLogger = new Logger( this.getName() );

    protected dynamicChannelService: DynamicChannelService | null;

    public static getName() {
        return "VertixBot/UI-General/AdminAdapterExuBase";
    }

    public constructor( options: TAdapterRegisterOptions ) {
        super( options );

        this.dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel", { silent: true } ) ?? null;
    }

    public getPermissions(): PermissionsBitField {
        return new PermissionsBitField( DEFAULT_SETUP_PERMISSIONS );
    }

    public getChannelTypes() {
        return [ ChannelType.GuildVoice, ChannelType.GuildText ];
    }

    public async isPassingInteractionRequirementsInternal( interaction: TInteraction ) {
        return isPassingBotGuildPermissions( interaction );
    }
}
