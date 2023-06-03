import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";
import { UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { uiUtilsWrapAsTemplate } from "@vertix/ui-v2/ui-utils";

/**
 * Shown when the owner of the channel has been absent.
 */
export class ClaimStartEmbed extends UIEmbedBase {
    private static vars: any = {
        ownerId: uiUtilsWrapAsTemplate( "ownerId" ),
        ownerDisplayName: uiUtilsWrapAsTemplate( "ownerDisplayName" ),

        absentMinutes: uiUtilsWrapAsTemplate( "absentMinutes" ),
    };

    public static getName() {
        return "Vertix/UI-V2/ClaimStartEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getTitle() {
        return `👋  ${ ClaimStartEmbed.vars.ownerDisplayName } abandoned his channel!`;
    }

    protected getDescription(): string {
        return `<@${ ClaimStartEmbed.vars.ownerId }> has been absent for more than ${ ClaimStartEmbed.vars.absentMinutes } minutes.\n` +
            "Will you be the one to take charge? Step up and claim it for yourself!";
    }

    protected getLogic( args: UIArgs ){
        const { ownerDisplayName, ownerId, absentInterval } = args;

        return {
            ownerId,
            ownerDisplayName,
            absentMinutes: ( absentInterval / 60000 ).toFixed( 1 )
        };
    }
}
