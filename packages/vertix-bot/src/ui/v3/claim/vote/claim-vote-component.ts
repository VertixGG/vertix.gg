import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";
import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import { UIMarkdownsGroupBase } from "@vertix.gg/gui/src/bases/ui-markdowns-group-base";

import { ClaimVoteEmbed } from "@vertix.gg/bot/src/ui/v3/claim/vote/claim-vote-embed";
import { ClaimVoteStepInButton } from "@vertix.gg/bot/src/ui/v3/claim/vote/claim-vote-step-in-button";
import { ClaimVoteWonEmbed } from "@vertix.gg/bot/src/ui/v3/claim/vote/calim-vote-won-embed";
import { ClaimVoteStepInEmbed } from "@vertix.gg/bot/src/ui/v3/claim/vote/claim-vote-step-in-embed";
import { ClaimVoteElementsGroup } from "@vertix.gg/bot/src/ui/v3/claim/vote/claim-vote-elements-group";
import { ClaimVoteResultsMarkdown } from "@vertix.gg/bot/src/ui/v3/claim/vote/claim-vote-results-markdown";

export class ClaimVoteComponent extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V3/ClaimVoteComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElementsGroups() {
        return [ClaimVoteElementsGroup, UIElementsGroupBase.createSingleGroup(ClaimVoteStepInButton)];
    }

    public static getDefaultElementsGroup() {
        return null;
    }

    public static getEmbedsGroups() {
        return [
            UIEmbedsGroupBase.createSingleGroup(ClaimVoteStepInEmbed),
            UIEmbedsGroupBase.createSingleGroup(ClaimVoteEmbed),
            UIEmbedsGroupBase.createSingleGroup(ClaimVoteWonEmbed)
        ];
    }

    public static getDefaultEmbedsGroup() {
        return null;
    }

    public static getMarkdownsGroups() {
        return [UIMarkdownsGroupBase.createSingleGroup(ClaimVoteResultsMarkdown)];
    }

    public static getDefaultMarkdownsGroup() {
        return null;
    }
}
