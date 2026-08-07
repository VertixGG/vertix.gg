import { DEFAULT_RTC_REGIONS } from "@vertix.gg/definitions/src/rtc-region-definitions";
import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";

import { DynamicChannelRegionButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/region/dynamic-channel-region-button";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const utcRegionVars = Object.values( DEFAULT_RTC_REGIONS ).reduce( ( acc, region ) => {
    acc[ `region-${ region }` ] = uiUtilsWrapAsTemplate( `region-${ region }` );
    return acc;
}, {} as Record<string, string> );

const vars = {
    region: uiUtilsWrapAsTemplate( "region" ),
    regionOptions: uiUtilsWrapAsTemplate( "regionOptions" ),
    regionEmoji: uiUtilsWrapAsTemplate( "regionEmoji" ),
    ...utcRegionVars
};

const DynamicChannelRegionEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V3/DynamicChannelRegionEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0x4b6f91 )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( () => `${ vars.regionEmoji }  Set voice region for your channel` )
    .setDescription( () => (
        "-# The region determines the voice server's location.\n" +
        "-# It should be the closest to all voice channel members.\n" +
        "-# The recommended is `Automatic`\n\n" +
        "Current voice region: `" +
        vars.region +
        "`"
    ) )
    .setOptions( () => {
        const mapRegions: Record<string, string> = {};

        Object.entries( DEFAULT_RTC_REGIONS ).forEach( ( [ label, value ] ) => {
            const key = ( "region-" + ( value ?? "auto" ) );
            // @ts-ignore
            const utcRegionVar = vars[ key ];

            mapRegions[ utcRegionVar ] = label;
        } );

        return {
            region: mapRegions
        };
    } )
    .setLogic( async( args: UIArgs ) => {
        const result: any = {};

        if ( args.region ) {
            // @ts-ignore
            result.region = vars[ `region-${ args.region }` ];
        } else {
            // @ts-ignore
            result.region = vars[ "region-auto" ];
        }

        return result;
    } ).
    setDefaultVars( () => ( {
        regionEmoji: DynamicChannelRegionButton.getEmoji()
    } ) )
    .build();

export { DynamicChannelRegionEmbed, vars as DYNAMIC_CHANNEL_REGION_VARS };
