import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import { AdapterBuilderBase } from "@vertix.gg/gui/src/builders/adapter-builder-base";

import { NoActiveDynamicChannelComponent } from "@vertix.gg/bot/src/ui/general/no-active-dynamic-channel/no-active-dynamic-channel-component";

import type { TextChannel } from "discord.js";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { IAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type { UIDefaultButtonChannelTextInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

const NoActiveDynamicChannelAdapter = new AdapterBuilderBase<
    TextChannel,
    UIDefaultButtonChannelTextInteraction,
        typeof UIAdapterBase<TextChannel, UIDefaultButtonChannelTextInteraction>,
        UIArgs,
        IAdapterContext<UIDefaultButtonChannelTextInteraction, UIArgs>
>( "VertixBot/UI-General/NoActiveDynamicChannelAdapter", UIAdapterBase )
    .setComponent( NoActiveDynamicChannelComponent )
    .getReplyArgs( async( _context, _interaction, argsFromManager ) => ( {
        masterChannelId: argsFromManager?.masterChannelId
    } ) )
    .disableMiddleware()
    .build();

export { NoActiveDynamicChannelAdapter };
