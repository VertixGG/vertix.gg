import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_BRAND_THUMBNAIL_URL, VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

/**
 * What the bot does and what to type, grouped by who can type it.
 *
 * Grouped that way because the first thing anyone reading help wants to know is which of these are
 * for them - a member looking at a list where most rows need Manage Server learns only that the bot
 * is not theirs. The channel rows are the ones most people need and they come first.
 *
 * Nothing here asks the bot for anything. Help is the screen someone reaches when the rest is not
 * working, so it must not be the second thing that fails: no channel is read, no permission is
 * required, and every button beside it is a link, which discord opens without the bot involved.
 *
 * The guides are named rather than linked inline - they are buttons underneath, and a paragraph of
 * markdown links saying the same thing twice reads as clutter.
 */
const HelpEmbed = new EmbedBuilder( "VertixBot/UI-General/HelpEmbed" )
    .setInstanceType( UIInstancesTypes.Static )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setThumbnail( VERTIX_BRAND_THUMBNAIL_URL )
    .setTitle( "❔ VoiceChannels help" )
    .setDescription(
        "VoiceChannels gives your server voice channels that create themselves. " +
        "Join the generator channel and you get your own, which is deleted when the last person leaves.\n\n" +

        "**Your channel**\n" +
        "Anything below works while you are in a channel you own.\n" +
        "`/voice rename` ∙ name it\n" +
        "`/voice limit` ∙ how many may join\n" +
        "`/voice privacy` ∙ public, private or hidden\n" +
        "`/voice status` ∙ the status shown on it\n" +
        "`/voice access` ∙ grant, deny or kick members\n\n" +

        "**Anyone**\n" +
        "`/voice invite` ∙ invite someone to a channel\n" +
        "`/voice claim` ∙ take over a channel whose owner left\n\n" +

        "**Server admins**\n" +
        "`/setup` ∙ set up and configure the bot\n" +
        "`/manage new-generator` ∙ add another generator\n" +
        "`/manage edit` ∙ edit an existing one\n" +
        "`/manage roles` ∙ voice, verified and staff roles\n" +
        "`/manage server-options` ∙ roles, bad words and claim timings\n" +
        "`/manage language` ∙ the language the bot speaks here\n\n" +

        "New here? Start with **Setup** below - it walks the whole thing in a few minutes. " +
        "**Dashboard** configures everything without typing a command, and if none of the guides " +
        "help, the **Support Server** is a person."
    )
    .build();

export { HelpEmbed };
