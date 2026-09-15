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
 * Told when the channel a screen was opened about has since been deleted.
 *
 * A screen outlives its channel, so a press can arrive about one that no longer exists. This
 * replaces that screen rather than answering beside it - see `channel-gone-gate.ts` beside it.
 *
 * One sentence and nothing to press, so the embed and the component it needs are here rather than
 * in files of their own - neither is referenced anywhere else, and split up they were two thirds of
 * the notice being scaffolding. The words stay a declared embed, which is what puts them in
 * `assets/languages/*.json` and so within reach of a translator.
 */
const ChannelGoneEmbed = new EmbedBuilder( "VertixBot/UI-General/ChannelGoneEmbed" )
    .setInstanceType( UIInstancesTypes.Static )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setThumbnail( VERTIX_BRAND_THUMBNAIL_URL )
    .setTitle( "🕳  That channel is gone" )
    .setDescription(
        "The channel this screen was opened about no longer exists - a dynamic channel is removed " +
        "once the last person leaves it.\n\n" +
        "Run the command again to work on the one you have now."
    )
    .build();

class ChannelGoneComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-General/ChannelGoneComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    public static getEmbeds() {
        return [ ChannelGoneEmbed ];
    }
}

const ChannelGoneAdapter = new AdapterBuilderBase<
    TextChannel,
    UIDefaultButtonChannelTextInteraction,
    typeof UIAdapterBase<TextChannel, UIDefaultButtonChannelTextInteraction>,
    UIArgs,
    IAdapterContext<UIDefaultButtonChannelTextInteraction, UIArgs>
>( "VertixBot/UI-General/ChannelGoneAdapter", UIAdapterBase )
    .setComponent( ChannelGoneComponent )
    // The embed says one fixed thing and reads nothing, but the base makes this mandatory - left
    // out, the reply throws rather than rendering an argument-less embed.
    .getReplyArgs( async() => ( {} ) )
    .disableMiddleware()
    .build();

export { ChannelGoneAdapter };
