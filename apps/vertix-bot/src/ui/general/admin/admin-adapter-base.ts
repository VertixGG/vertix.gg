import { ChannelType, PermissionsBitField } from "discord.js";

import { Logger } from "@vertix.gg/base/src/modules/logger";

import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import { DEFAULT_SETUP_PERMISSIONS } from "@vertix.gg/bot/src/definitions/master-channel";

import { isPassingBotGuildPermissions } from "@vertix.gg/bot/src/ui/general/admin/bot-permissions-requirement";

import type { UIAdapterReplyContext, UIAdapterStartContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

export class AdminAdapterBase<
    TChannel extends UIAdapterStartContext,
    TInteraction extends UIAdapterReplyContext
> extends UIAdapterBase<TChannel, TInteraction> {
    protected static dedicatedLogger = new Logger( this.getName() );

    public static getName() {
        return "VertixBot/UI-General/AdminAdapterBase";
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
