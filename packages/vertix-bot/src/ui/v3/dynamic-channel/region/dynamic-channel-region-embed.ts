import { DEFAULT_RTC_REGIONS } from "@vertix.gg/base/src/definitions/rtc-regions";
import { UI_IMAGE_EMPTY_LINE_URL } from "@vertix.gg/gui/src/bases/ui-definitions";
import { UIEmbedVars } from "@vertix.gg/gui/src/ui-embed/ui-embed-vars";

import { UIEmbedWithVarsExtend } from "@vertix.gg/gui/src/ui-embed/ui-embed-with-vars";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import { DynamicChannelEmbedBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-embed-base";

import { DynamicChannelRegionButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/region/dynamic-channel-region-button";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

type ValueOf<T> = T[keyof T];
type RegionKeys = `region-${ ValueOf<typeof DEFAULT_RTC_REGIONS> }`;

const utcRegionVars = Object.values( DEFAULT_RTC_REGIONS ).map( region => {
    return `region-${ region }`;
} ) as [RegionKeys];

const vars = new UIEmbedVars(
    "region",
    "regionOptions",
    "regionEmoji",
    ... utcRegionVars
);

export class DynamicChannelRegionEmbed extends UIEmbedWithVarsExtend( DynamicChannelEmbedBase, vars ) {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelRegionEmbed";
    }

    protected getImage(): string {
        return UI_IMAGE_EMPTY_LINE_URL;
    }

    protected getTitle() {
        return `${ this.vars.get().regionEmoji }  Set voice region for your channel`;
    }

    protected getDescription() {
        return "-# The region determines the voice server's location.\n"+
            "-# It should be the closest to all voice channel members.\n" +
            "-# The recommended is `Automatic`\n\n" +
            "Current voice region: `" + this.vars.get( "region" ) + "`";
    }

    protected getOptions() {
        const mapRegions: Record<string, string> = {};

        Object.entries( DEFAULT_RTC_REGIONS ).forEach( ( [ label, value ] ) => {
            const key = ( "region-" + (value ?? "auto") ) as RegionKeys,
                utcRegionVar = this.vars.get( key );

            mapRegions[ utcRegionVar ] = label;
        } );

        return {
            region: mapRegions
        };
    }

    protected async getLogicAsync( args: UIArgs ) {
        const result = super.getLogic( args );

        if ( args.region ) {
            result.region = this.vars.get( `region-${ args.region }` as RegionKeys );
        } else {
            result.region = this.vars.get( "region-auto" );
        }

        result.regionEmoji = await EmojiManager.$.getMarkdown( DynamicChannelRegionButton.getBaseName() );

        return result;
    }
}
