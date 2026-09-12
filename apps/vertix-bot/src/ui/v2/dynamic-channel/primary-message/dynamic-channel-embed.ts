import { DEFAULT_RTC_REGIONS } from "@vertix.gg/definitions/src/rtc-region-definitions";

import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";

import { UIInstancesTypes, UI_IMAGE_EMPTY_LINE_URL } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * A var per region, which is what lets the screen name one in the reader's own language - the
 * option map answers `{region-us-west}` with "US West", and each language file with its own.
 */
const rtcRegionVars = Object.values( DEFAULT_RTC_REGIONS ).reduce( ( acc, region ) => {
    acc[ `region-${ region }` ] = uiUtilsWrapAsTemplate( `region-${ region }` );

    return acc;
}, {} as Record<string, string> );

const vars = {
    ... rtcRegionVars,

    name: uiUtilsWrapAsTemplate( "name" ),
    limit: uiUtilsWrapAsTemplate( "limit" ),
    state: uiUtilsWrapAsTemplate( "state" ),
    region: uiUtilsWrapAsTemplate( "region" ),

    limitDisplayValue: uiUtilsWrapAsTemplate( "limitDisplayValue" ),
    limitDisplayUnlimited: uiUtilsWrapAsTemplate( "limitDisplayUnlimited" ),
    limitValue: uiUtilsWrapAsTemplate( "limitValue" ),

    statePublic: uiUtilsWrapAsTemplate( "statePublic" ),
    statePrivate: uiUtilsWrapAsTemplate( "statePrivate" ),

    visibilityState: uiUtilsWrapAsTemplate( "visibilityState" ),
    visibilityStateShown: uiUtilsWrapAsTemplate( "visibilityStateShown" ),
    visibilityStateHidden: uiUtilsWrapAsTemplate( "visibilityStateHidden" ),

    regionDisplayValue: uiUtilsWrapAsTemplate( "regionDisplayValue" ),
    regionDisplayAuto: uiUtilsWrapAsTemplate( "regionDisplayAuto" ),
    regionValue: uiUtilsWrapAsTemplate( "regionValue" )
};

/**
 * Function resolveRegionVar() :: The var naming a region, or the one naming no choice at all.
 *
 * A region discord adds before this map knows of it resolves to nothing, and reads as automatic
 * rather than as a raw name the reader has no use for.
 */
function resolveRegionVar( region: unknown ) {
    const key = `region-${ "string" === typeof region && region.length ? region : "auto" }`;

    return rtcRegionVars[ key ] ?? rtcRegionVars[ "region-auto" ];
}

const DynamicChannelEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V2/DynamicChannelEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( () => "༄ Manage your Dynamic Channel" )
    .setDescription( () => (
        "Embrace the responsibility of overseeing your dynamic channel, diligently customizing it according to your discerning preferences.\n\n" +
            "Please be advised that the privilege to make alterations is vested solely of the channel owner.\n\n" +
            "_Current settings_:\n" +
        `- Name: **${ vars.name }**\n` +
        `- User Limit: ✋ **${ vars.limit }**\n` +
        `- State: ${ vars.state }\n` +
        `- Visibility State: ${ vars.visibilityState }\n` +
        `- Region: 🌍 **${ vars.region }**`
    ) )
    .setOptions( () => ( {
        limit: {
            [ vars.limitDisplayValue ]: vars.limitValue,
            [ vars.limitDisplayUnlimited ]: "Unlimited"
        },
        state: {
            [ vars.statePublic ]: "🌐 **Public**",
            [ vars.statePrivate ]: "🚫 **Private**"
        },
        visibilityState: {
            [ vars.visibilityStateShown ]: "🐵 **Shown**",
            [ vars.visibilityStateHidden ]: "🙈 **Hidden**"
        },
        region: Object.entries( DEFAULT_RTC_REGIONS ).reduce( ( acc, [ label, value ] ) => {
            acc[ rtcRegionVars[ `region-${ value }` ] ] = label;

            return acc;
        }, {} as Record<string, string> )
    } ) )
    .setLogic( ( args: UIArgs ) => {
        const {
            limitDisplayValue,
            limitDisplayUnlimited,
            statePublic,
            statePrivate,
            visibilityStateShown,
            visibilityStateHidden
        } = vars;

        return {
            name: args.channelName,
            limit: 0 === args.userLimit ? limitDisplayUnlimited : limitDisplayValue,
            state: args.isPrivate ? statePrivate : statePublic,
            visibilityState: args.isHidden ? visibilityStateHidden : visibilityStateShown,
            region: resolveRegionVar( args.region ),
            limitValue: args.userLimit,
            regionValue: args.region
        };
    } )
    .setDefaultVars( () => ( {
        name: "Channel Name",
        limit: "Unlimited",
        state: "🌐 **Public**",
        visibilityState: "🐵 **Shown**",
        region: "Automatic"
    } ) )
    .build();

export { DynamicChannelEmbed };
