import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

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
        return "VertixBot/UI-V2/ClaimStartEmbed";
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
