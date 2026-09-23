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
 * What a command says when it could not finish.
 *
 * Nothing about what went wrong - whoever ran it can do nothing with that, and it is in the log
 * where it can be acted on. What they do need is to know the command is over, because the one
 * thing worse than an error is discord's own "the application did not respond", which says the
 * bot is broken rather than that this went wrong.
 *
 * One sentence and nothing to press, so the embed and the component it needs are here rather than
 * in files of their own - neither is referenced anywhere else, and split up they were two thirds of
 * the notice being scaffolding. The words stay a declared embed, which is what puts them in
 * `assets/languages/*.json` and so within reach of a translator.
 */
const CommandFailedEmbed = new EmbedBuilder( "VertixBot/UI-General/CommandFailedEmbed" )
    .setInstanceType( UIInstancesTypes.Static )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setThumbnail( VERTIX_BRAND_THUMBNAIL_URL )
    .setTitle( "⚠  That did not work" )
    .setDescription(
        "Something went wrong running that command.\n\n" +
        "It has been logged. Trying again is worth a go — if it keeps happening, tell us in the support server."
    )
    .build();

class CommandFailedComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-General/CommandFailedComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    public static getEmbeds() {
        return [ CommandFailedEmbed ];
    }
}

const CommandFailedAdapter = new AdapterBuilderBase<
    TextChannel,
    UIDefaultButtonChannelTextInteraction,
    typeof UIAdapterBase<TextChannel, UIDefaultButtonChannelTextInteraction>,
    UIArgs,
    IAdapterContext<UIDefaultButtonChannelTextInteraction, UIArgs>
>( "VertixBot/UI-General/CommandFailedAdapter", UIAdapterBase )
    .setComponent( CommandFailedComponent )
    .setShownWhen( [
        {
            source: "VertixBot/UI-General/CommandsFlow",
            description: "A command was run and something went wrong carrying it out."
        }
    ] )
    // The embed says one fixed thing and reads nothing, but the base makes this mandatory - left
    // out, the reply throws rather than rendering an argument-less embed.
    .getReplyArgs( async() => ( {} ) )
    .disableMiddleware()
    .build();

export { CommandFailedAdapter };
