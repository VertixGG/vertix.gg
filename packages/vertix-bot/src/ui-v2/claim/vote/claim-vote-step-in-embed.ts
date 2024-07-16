import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UIEmbedElapsedTimeBase } from "@vertix.gg/gui/src/bases/ui-embed-time-elapsed-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * Shown when a user is trying to claim a channel and the channel.
 * (if less than 1 minute = shows `x` seconds).
 */
export class ClaimVoteStepInEmbed extends UIEmbedElapsedTimeBase {
    private static vars: any = {
        userInitiatorId: uiUtilsWrapAsTemplate( "userInitiatorId" ),
        userInitiatorDisplayName: uiUtilsWrapAsTemplate( "userInitiatorDisplayName" ),
    };

    public static getName() {
        return "Vertix/UI-V2/ClaimVoteStepInEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getEndTime( args: UIArgs ) {
        return new Date( args.timeEnd );
    }

    protected getTitle() {
        return `👑  ${ ClaimVoteStepInEmbed.vars.userInitiatorDisplayName } wish to claim this channel`;
    }

    protected getDescription() {
        const { userInitiatorId } = ClaimVoteStepInEmbed.vars,
            timeleft = this.getElapsedTimeFormatFractionVariable();

        return `Unless someone else steps up, <@${ userInitiatorId }> will be the proud owner of this channel in just \`${ timeleft }\`.`;
    }

    protected getLogic( args: UIArgs ) {
        const result: any = {};

        result.userInitiatorId = args.userInitiatorId;
        result.userInitiatorDisplayName = args.userInitiatorDisplayName;

        return result;
    }
}
