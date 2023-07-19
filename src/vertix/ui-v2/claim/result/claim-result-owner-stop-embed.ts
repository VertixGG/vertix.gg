import { uiUtilsWrapAsTemplate } from "@vertix-base/utils/ui";

import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";
import { UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

/**
 * Shown when the owner of the channel has returned or click on "Claim button" and the channel is no longer claimable.
 */
export class ClaimResultOwnerStopEmbed extends UIEmbedBase {
    private static vars: any = {
        absentMinutes: uiUtilsWrapAsTemplate( "absentMinutes" ),
    };

    public static getName() {
        return "Vertix/UI-V2/ClaimResultOwnerStopEmbed";
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
