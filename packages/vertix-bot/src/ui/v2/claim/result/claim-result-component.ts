import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";

import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { ClaimResultOwnerStopEmbed } from "@vertix.gg/bot/src/ui/v2/claim/result/claim-result-owner-stop-embed";
import { ClaimResultStepInEmbed } from "@vertix.gg/bot/src/ui/v2/claim/result/claim-result-step-in-embed";
import { ClaimResultStepAlreadyInEmbed } from "@vertix.gg/bot/src/ui/v2/claim/result/claim-result-step-already-in-embed";
import { ClaimResultVotedEmbed } from "@vertix.gg/bot/src/ui/v2/claim/result/claim-result-voted-embed";
import { ClaimResultVoteUpdatedEmbed } from "@vertix.gg/bot/src/ui/v2/claim/result/claim-result-vote-updated-embed";
import { ClaimResultVoteSelfEmbed } from "@vertix.gg/bot/src/ui/v2/claim/result/claim-result-vote-self-embed";
import { ClaimResultVotedSameEmbed } from "@vertix.gg/bot/src/ui/v2/claim/result/claim-result-voted-same-embed";

export class ClaimResultComponent extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V2/ClaimResultComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getEmbedsGroups() {
        return [
            // TODO: All the control from vote in order select the right embeds was too hard to implement.
            // TODO: Check `handleVoteStepIn` and `handleVoteStepOut`.
            UIEmbedsGroupBase.createSingleGroup( ClaimResultOwnerStopEmbed ),

            UIEmbedsGroupBase.createSingleGroup( ClaimResultVotedEmbed ),
            UIEmbedsGroupBase.createSingleGroup( ClaimResultVotedSameEmbed ),
            UIEmbedsGroupBase.createSingleGroup( ClaimResultVoteUpdatedEmbed ),

            UIEmbedsGroupBase.createSingleGroup( ClaimResultStepInEmbed ),
            UIEmbedsGroupBase.createSingleGroup( ClaimResultStepAlreadyInEmbed ),

            UIEmbedsGroupBase.createSingleGroup( ClaimResultVoteSelfEmbed )
        ];
    }

    public static getDefaultEmbedsGroup() {
        return null;
    }
}
