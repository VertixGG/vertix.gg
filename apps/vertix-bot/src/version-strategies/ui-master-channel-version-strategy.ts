import { VoiceChannel } from "discord.js";

import { UIVersionStrategyBase } from "@vertix.gg/gui/src/bases/ui-version-strategy-base";

import { MasterChannelDataModelV3 } from "@vertix.gg/base/src/models/master-channel/master-channel-data-model-v3";

import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";

import type { Base } from "discord.js";

export class UIMasterChannelVersionStrategy extends UIVersionStrategyBase {
    public static getName() {
        return "VertixBot/VersionStrategies/UIMasterChannelVersionStrategy";
    }

    private getMaxRegisteredVersion(): number {
        let max = 0;

        for ( const version of this.versions.keys() ) {
            if ( version > max ) {
                max = version;
            }
        }

        return max;
    }

    private resolveRegisteredVersion( rawVersion: string | null | undefined ): number {
        if ( typeof rawVersion !== "string" || rawVersion.length === 0 ) {
            return 0;
        }

        const lastSegment = rawVersion.split( "." ).at( -1 );

        if ( typeof lastSegment !== "string" || lastSegment.length === 0 ) {
            return 0;
        }

        const parsed = Number.parseInt( lastSegment, 10 );

        if ( Number.isNaN( parsed ) ) {
            return 0;
        }

        return this.versions.has( parsed ) ? parsed : 0;
    }

    public async determine( context?: Base | string ) {
        let resolvedVersion = 0;

        if ( context instanceof VoiceChannel ) {
            const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( context.id, true );

            if ( !masterChannelDB ) {
                return 0;
            }

            resolvedVersion = this.resolveRegisteredVersion( masterChannelDB.version );
        } else if ( "string" === typeof context ) {
            const masterChannelDB = await ChannelModel.$.getByChannelId( context, true );

            if ( masterChannelDB ) {
                resolvedVersion = this.resolveRegisteredVersion( masterChannelDB.version );
            } else {
                const data = await MasterChannelDataModelV3.$.getSettings( context );

                if ( data ) {
                    resolvedVersion = this.getMaxRegisteredVersion();
                }
            }
        }

        return resolvedVersion;
    }
}

export default UIMasterChannelVersionStrategy;
