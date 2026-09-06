import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import { AdapterBuilderBase } from "@vertix.gg/gui/src/builders/adapter-builder-base";

import { UnassignableRoleComponent } from "@vertix.gg/bot/src/ui/general/server-options/unassignable-role-component";

import type { TextChannel } from "discord.js";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { IAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type { UIDefaultButtonChannelTextInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

const UnassignableRoleAdapter = new AdapterBuilderBase<
    TextChannel,
    UIDefaultButtonChannelTextInteraction,
        typeof UIAdapterBase<TextChannel, UIDefaultButtonChannelTextInteraction>,
        UIArgs,
        IAdapterContext<UIDefaultButtonChannelTextInteraction, UIArgs>
>( "VertixBot/UI-General/UnassignableRoleAdapter", UIAdapterBase )
    .setComponent( UnassignableRoleComponent )
    .getReplyArgs( async( _context, _interaction, argsFromManager ) => ( {
        roleId: argsFromManager?.roleId,
        reason: argsFromManager?.reason
    } ) )
    .disableMiddleware()
    .build();

export { UnassignableRoleAdapter };
