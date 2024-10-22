import { uiUtilsWrapAsTemplate } from "@vertix.gg/bot/src/ui-v2/ui-utils";

import { UIEmbedBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-embed-base";

import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import type { UIArgs } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

/**
 * Shown when the owner of the channel has returned or click on "Claim button" and the channel is no longer claimable.
 */
export class ClaimResultOwnerStopEmbed extends UIEmbedBase {
    private static vars: any = {
        absentMinutes: uiUtilsWrapAsTemplate( "absentMinutes" ),
    };

    public static getName() {
        return "VertixBot/UI-V2/ClaimResultOwnerStopEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getTitle() {
        return "👑  You're back in charge!";
    }

    protected getDescription(): string {
        return `Please be aware that if you don't return within **${ ClaimResultOwnerStopEmbed.vars.absentMinutes }** minutes, the channel will once again become available for other members to claim.\n`;
    }

    protected getLogic( args: UIArgs ){
        return {
            absentMinutes: ( args.absentInterval / 60000 ).toFixed( 1 )
        };
    }
}
