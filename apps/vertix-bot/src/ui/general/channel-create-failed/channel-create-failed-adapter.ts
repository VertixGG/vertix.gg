import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import { AdapterBuilderBase } from "@vertix.gg/gui/src/builders/adapter-builder-base";

import { ChannelCreateFailedComponent } from "@vertix.gg/bot/src/ui/general/channel-create-failed/channel-create-failed-component";

import type { TextChannel } from "discord.js";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { IAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type { UIDefaultButtonChannelTextInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

const ChannelCreateFailedAdapter = new AdapterBuilderBase<
    TextChannel,
    UIDefaultButtonChannelTextInteraction,
        typeof UIAdapterBase<TextChannel, UIDefaultButtonChannelTextInteraction>,
        UIArgs,
        IAdapterContext<UIDefaultButtonChannelTextInteraction, UIArgs>
>( "VertixBot/UI-General/ChannelCreateFailedAdapter", UIAdapterBase )
    .setComponent( ChannelCreateFailedComponent )
    .getReplyArgs( async( _context, _interaction, argsFromManager ) => ( {
        masterChannelId: argsFromManager?.masterChannelId,
        isCategoryFull: argsFromManager?.isCategoryFull
    } ) )
    .disableMiddleware()
    .build();

export { ChannelCreateFailedAdapter };
