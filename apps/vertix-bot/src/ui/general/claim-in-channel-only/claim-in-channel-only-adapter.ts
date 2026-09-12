import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import { AdapterBuilderBase } from "@vertix.gg/gui/src/builders/adapter-builder-base";

import { ClaimInChannelOnlyComponent } from "@vertix.gg/bot/src/ui/general/claim-in-channel-only/claim-in-channel-only-component";

import type { TextChannel } from "discord.js";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { IAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type { UIDefaultButtonChannelTextInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

const ClaimInChannelOnlyAdapter = new AdapterBuilderBase<
    TextChannel,
    UIDefaultButtonChannelTextInteraction,
        typeof UIAdapterBase<TextChannel, UIDefaultButtonChannelTextInteraction>,
        UIArgs,
        IAdapterContext<UIDefaultButtonChannelTextInteraction, UIArgs>
>( "VertixBot/UI-General/ClaimInChannelOnlyAdapter", UIAdapterBase )
    .setComponent( ClaimInChannelOnlyComponent )
    .disableMiddleware()
    .build();

export { ClaimInChannelOnlyAdapter };
