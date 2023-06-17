// TODO: Sort out imports
import { UIComponentBase } from "@vertix/ui-v2/_base/ui-component-base";
import { ClaimResultOwnerStopEmbed } from "@vertix/ui-v2/claim/result/claim-result-owner-stop-embed";
import { UIEmbedsGroupBase } from "@vertix/ui-v2/_base/ui-embeds-group-base";
import { UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";
import { ClaimResultStepInEmbed } from "@vertix/ui-v2/claim/result/claim-result-step-in-embed";
import { ClaimResultStepAlreadyInEmbed } from "@vertix/ui-v2/claim/result/claim-result-step-already-in-embed";
import { ClaimResultVotedEmbed } from "@vertix/ui-v2/claim/result/claim-result-voted-embed";
import { ClaimResultVoteUpdatedEmbed } from "@vertix/ui-v2/claim/result/claim-result-vote-updated-embed";
import { ClaimResultVoteSelfEmbed } from "@vertix/ui-v2/claim/result/claim-result-vote-self-embed";
import { ClaimResultVotedSameEmbed } from "@vertix/ui-v2/claim/result/claim-result-voted-same-embed";

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

            UIEmbedsGroupBase.createSingleGroup( ClaimResultVoteSelfEmbed ),
        ];
    }

    protected static getDefaultEmbedsGroup() {
        return null;
    }
}
