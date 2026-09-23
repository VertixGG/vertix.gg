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
 * Told to whoever asked a v3 command of a v2 channel.
 *
 * The command exists and the channel is real; it is the generator's interface that is older than
 * the feature. Saying so names the thing an admin can actually change.
 *
 * One sentence and nothing to press, so the embed and the component it needs are here rather than
 * in files of their own - neither is referenced anywhere else, and split up they were two thirds of
 * the notice being scaffolding. The words stay a declared embed, which is what puts them in
 * `assets/languages/*.json` and so within reach of a translator.
 */
const FeatureMissingInV2Embed = new EmbedBuilder( "VertixBot/UI-General/FeatureMissingInV2Embed" )
    .setInstanceType( UIInstancesTypes.Static )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setThumbnail( VERTIX_BRAND_THUMBNAIL_URL )
    .setTitle( "⚠  Not in this generator's interface" )
    .setDescription(
        "This channel comes from a generator running the older interface, which does not have that feature.\n\n" +
        "A server admin can upgrade the generator to get it."
    )
    .build();

class FeatureMissingInV2Component extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-General/FeatureMissingInV2Component";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    public static getEmbeds() {
        return [ FeatureMissingInV2Embed ];
    }
}

const FeatureMissingInV2Adapter = new AdapterBuilderBase<
    TextChannel,
    UIDefaultButtonChannelTextInteraction,
    typeof UIAdapterBase<TextChannel, UIDefaultButtonChannelTextInteraction>,
    UIArgs,
    IAdapterContext<UIDefaultButtonChannelTextInteraction, UIArgs>
>( "VertixBot/UI-General/FeatureMissingInV2Adapter", UIAdapterBase )
    .setComponent( FeatureMissingInV2Component )
    .setShownWhen( [
        {
            source: "VertixBot/UI-General/CommandsFlow",
            description: "You ran a command for something this server's older interface does not have."
        }
    ] )
    // The embed says one fixed thing and reads nothing, but the base makes this mandatory - left
    // out, the reply throws rather than rendering an argument-less embed.
    .getReplyArgs( async() => ( {} ) )
    .disableMiddleware()
    .build();

export { FeatureMissingInV2Adapter };
