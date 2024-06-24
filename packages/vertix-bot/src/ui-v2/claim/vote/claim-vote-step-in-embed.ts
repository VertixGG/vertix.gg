import { uiUtilsWrapAsTemplate } from "@vertix.gg/base/src/utils/ui";

import { UIEmbedElapsedTimeBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-embed-time-elapsed-base";

import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import type { UIArgs} from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

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
