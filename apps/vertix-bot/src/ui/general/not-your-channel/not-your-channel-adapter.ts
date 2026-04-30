import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import { AdapterBuilderBase } from "@vertix.gg/gui/src/builders/adapter-builder-base";

import { NotYourChannelComponent } from "@vertix.gg/bot/src/ui/general/not-your-channel/not-your-channel-component";

import type { VoiceChannel } from "discord.js";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { IAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

const NotYourChannelAdapter = new AdapterBuilderBase<
    VoiceChannel,
    UIDefaultButtonChannelVoiceInteraction,
        typeof UIAdapterBase<VoiceChannel, UIDefaultButtonChannelVoiceInteraction>,
        UIArgs,
        IAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>
>( "VertixBot/UI-General/NotYourChannelAdapter", UIAdapterBase )
    .setComponent( NotYourChannelComponent )
    .getReplyArgs( async( _context, _interaction, argsFromManager ) => ( {
        masterChannelId: argsFromManager?.masterChannelId
    } ) )
    .disableMiddleware()
    .build();

export { NotYourChannelAdapter };
