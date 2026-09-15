import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";
import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { AdapterBuilderBase } from "@vertix.gg/gui/src/builders/adapter-builder-base";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";

import { VERTIX_BRAND_THUMBNAIL_URL, VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { TextChannel } from "discord.js";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { IAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type { UIDefaultButtonChannelTextInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

/**
 * Told to whoever typed a command into the bot's own direct messages.
 *
 * The commands are offered there at all so that this can be said: hidden from direct messages
 * instead, discord answers that the command does not exist, which reads as the bot being broken.
 *
 * One sentence and nothing to press, so the embed and the component it needs are here rather than
 * in files of their own - neither is referenced anywhere else, and split up they were two thirds of
 * the notice being scaffolding. The words stay a declared embed, which is what puts them in
 * `assets/languages/*.json` and so within reach of a translator.
 */
const NotInAServerEmbed = new EmbedBuilder( "VertixBot/UI-General/NotInAServerEmbed" )
    .setInstanceType( UIInstancesTypes.Static )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setThumbnail( VERTIX_BRAND_THUMBNAIL_URL )
    .setTitle( "🏠  Run this in a server" )
    .setDescription(
        "These commands act on a server's voice channels, and a direct message has neither.\n\n" +
        "Open the server you want and run it there."
    )
    .build();

class NotInAServerComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-General/NotInAServerComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    public static getEmbeds() {
        return [ NotInAServerEmbed ];
    }
}

const NotInAServerAdapter = new AdapterBuilderBase<
    TextChannel,
    UIDefaultButtonChannelTextInteraction,
    typeof UIAdapterBase<TextChannel, UIDefaultButtonChannelTextInteraction>,
    UIArgs,
    IAdapterContext<UIDefaultButtonChannelTextInteraction, UIArgs>
>( "VertixBot/UI-General/NotInAServerAdapter", UIAdapterBase )
    .setComponent( NotInAServerComponent )
    // The embed says one fixed thing and reads nothing, but the base makes this mandatory - left
    // out, the reply throws rather than rendering an argument-less embed.
    .getReplyArgs( async() => ( {} ) )
    .disableMiddleware()
    .build();

export { NotInAServerAdapter };
