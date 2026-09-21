import { bitrateToKilobits } from "@vertix.gg/definitions/src/bitrate-definitions";
import { DEFAULT_RTC_REGIONS } from "@vertix.gg/definitions/src/rtc-region-definitions";
import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

// A var per region, which is what lets the screen name one in the reader's own language - the
// option map answers `{region-us-west}` with "US West", and each language file with its own.
const rtcRegionVars = Object.values( DEFAULT_RTC_REGIONS ).reduce( ( acc, region ) => {
    acc[ `region-${ region }` ] = uiUtilsWrapAsTemplate( `region-${ region }` );
    return acc;
}, {} as Record<string, string> );

const vars = {
    region: uiUtilsWrapAsTemplate( "region" ),
    bitrate: uiUtilsWrapAsTemplate( "bitrate" ),
    ...rtcRegionVars
};

/**
 * Function resolveRegionVar() :: The var naming a region, or the one naming no choice at all.
 *
 * A region discord adds before this map knows of it resolves to nothing, and reads as automatic
 * rather than printing its own template at somebody.
 */
function resolveRegionVar( region: unknown ) {
    const key = `region-${ "string" === typeof region && region.length ? region : "auto" }`;

    return rtcRegionVars[ key ] ?? rtcRegionVars[ "region-auto" ];
}

const DynamicChannelRegionEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V2/DynamicChannelRegionEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0x4b6f91 )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( () => "🌍  Set voice region and quality for your channel" )
    .setDescription( () => (
        "-# The region determines the voice server's location.\n" +
        "-# It should be the closest to all voice channel members.\n" +
        "-# The recommended is `Automatic`\n" +
        "-# A higher bitrate sounds better and asks more of everyone's connection.\n\n" +
        "Current voice region: `" +
        vars.region +
        "`\n" +
        "Current bitrate: `" +
        vars.bitrate +
        " kbps`"
    ) )
    .setOptions( () => {
        const mapRegions: Record<string, string> = {};

        Object.entries( DEFAULT_RTC_REGIONS ).forEach( ( [ label, value ] ) => {
            mapRegions[ rtcRegionVars[ `region-${ value }` ] ] = label;
        } );

        return {
            region: mapRegions
        };
    } )
    .setLogic( async( args: UIArgs ) => {
        const result: UIArgs = {
            region: resolveRegionVar( args.region )
        };

        // Read off the channel rather than off the menu, so a channel sitting above what its guild
        // would now allow still reports what it actually is.
        if ( args.bitrate ) {
            result.bitrate = bitrateToKilobits( args.bitrate as number );
        }

        return result;
    } )
    .build();

export { DynamicChannelRegionEmbed };
