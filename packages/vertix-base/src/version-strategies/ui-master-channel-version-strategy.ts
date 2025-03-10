import { VoiceChannel } from "discord.js";

import { UIVersionStrategyBase } from "@vertix.gg/gui/src/bases/ui-version-strategy-base";

import { MasterChannelDataModelV3 } from "@vertix.gg/base/src/models/master-channel/master-channel-data-model-v3";

import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";

import type { Base } from "discord.js";

export class UIMasterChannelVersionStrategy extends UIVersionStrategyBase {
    public static getName () {
        return "VertixBase/VersionStrategies/UiMasterChannelVersionStrategy";
    }

    public async determine ( context?: Base | string ) {
        try {
            let masterChannelDBId;

            if ( context instanceof VoiceChannel ) {
                const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( context.id, true );

                if ( !masterChannelDB ) {
                    console.warn( `No master channel found for dynamic channel ID: ${ context.id }` );
                    return 0;
                }

                masterChannelDBId = masterChannelDB.id;
            } else if ( "string" === typeof context ) {
                // TODO: Find better solution
                masterChannelDBId = context;
            } else if ( !context ) {
                console.warn( "No context provided to UIMasterChannelVersionStrategy" );
                return 0;
            } else {
                console.warn( `Unsupported context type in UIMasterChannelVersionStrategy: ${ typeof context }` );
                return 0;
            }

            if ( !masterChannelDBId ) {
                console.warn( "Could not determine masterChannelDBId" );
                return 0;
            }

            const data = await MasterChannelDataModelV3.$.getSettings( masterChannelDBId );

            if ( !data ) {
                console.warn( `No V3 data found for master channel ID: ${ masterChannelDBId }` );
                return 2; // Default to V2 if no V3 data is found
            }

            return 3;
        } catch ( error ) {
            console.error( "Error in UIMasterChannelVersionStrategy:", error );
            return 0; // Return 0 on error to allow fallback to other strategies
        }
    }
}

export default UIMasterChannelVersionStrategy;
