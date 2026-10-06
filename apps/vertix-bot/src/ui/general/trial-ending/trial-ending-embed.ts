import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";

import { UIInstancesTypes, UI_IMAGE_BLUE_LINE_URL } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { JsonValue } from "@vertix.gg/gui/src/runtime/ui-definition-types";

const vars = {
    guildName: uiUtilsWrapAsTemplate( "guildName" ),
    planName: uiUtilsWrapAsTemplate( "planName" ),
    endsAt: uiUtilsWrapAsTemplate( "endsAt" ),
    maxMasterChannels: uiUtilsWrapAsTemplate( "maxMasterChannels" ),
    monthlyPriceUsd: uiUtilsWrapAsTemplate( "monthlyPriceUsd" )
};

/**
 * The heads-up a server's owner gets a couple of days before its free trial runs out.
 *
 * It says what the end takes away rather than only that it is coming, because that is what somebody
 * decides on - and nothing else tells them before they notice it gone. The server is named, since
 * an owner of several reads it in a direct message, away from the server it is about.
 */
const TrialEndingEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-General/TrialEndingEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_BLUE_LINE_URL )
    .setTitle( `⏳  Your free ${ vars.planName } trial is ending` )
    .setDescription(
        `The free ${ vars.planName } trial in **${ vars.guildName }** ends <t:${ vars.endsAt }:R>, on <t:${ vars.endsAt }:f>.\n\n` +
        "When it ends:\n" +
        "- **Custom bot look** - the name, avatar, banner and bio the bot wears in your server come off.\n" +
        `- **Generators** - only your first ${ vars.maxMasterChannels } keep making rooms.\n\n` +
        `Keep ${ vars.planName } for $${ vars.monthlyPriceUsd } a month on the dashboard.`
    )
    .setLogic( ( args: UIArgs ) => {
        const result: Record<string, JsonValue> = {
            guildName: args.guildName,
            planName: args.planName,
            endsAt: args.endsAt,
            maxMasterChannels: args.maxMasterChannels,
            monthlyPriceUsd: args.monthlyPriceUsd
        };

        return result;
    } )
    .setDefaultVars( () => ( {
        guildName: "My Server",
        planName: "Pro",
        endsAt: 1791057600,
        maxMasterChannels: 2,
        monthlyPriceUsd: 4
    } ) )
    .build();

export { TrialEndingEmbed };
