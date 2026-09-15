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
 * Told when a claim was asked for and there is nothing in the server to claim.
 *
 * One sentence and nothing to press, so the embed and the component it needs are here rather than
 * in files of their own - neither is referenced anywhere else, and split up they were two thirds of
 * the notice being scaffolding. The words stay a declared embed, which is what puts them in
 * `assets/languages/*.json` and so within reach of a translator.
 */
const NotClaimableEmbed = new EmbedBuilder( "VertixBot/UI-General/NotClaimableEmbed" )
    .setInstanceType( UIInstancesTypes.Static )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setThumbnail( VERTIX_BRAND_THUMBNAIL_URL )
    .setTitle( "🔒  Nothing to claim right now" )
    .setDescription(
        "No channel in this server is waiting for a new owner.\n\n" +
        "A channel becomes claimable when whoever owned it leaves and does not come back."
    )
    .build();

class NotClaimableComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-General/NotClaimableComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    public static getEmbeds() {
        return [ NotClaimableEmbed ];
    }
}

const NotClaimableAdapter = new AdapterBuilderBase<
    TextChannel,
    UIDefaultButtonChannelTextInteraction,
    typeof UIAdapterBase<TextChannel, UIDefaultButtonChannelTextInteraction>,
    UIArgs,
    IAdapterContext<UIDefaultButtonChannelTextInteraction, UIArgs>
>( "VertixBot/UI-General/NotClaimableAdapter", UIAdapterBase )
    .setComponent( NotClaimableComponent )
    // The embed says one fixed thing and reads nothing, but the base makes this mandatory - left
    // out, the reply throws rather than rendering an argument-less embed.
    .getReplyArgs( async() => ( {} ) )
    .disableMiddleware()
    .build();

export { NotClaimableAdapter };
