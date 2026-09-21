import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import {
    HelpChannelNamesButton,
    HelpFeaturesButton,
    HelpJoinToCreateButton,
    HelpLogsChannelButton,
    HelpSetupGuideButton
} from "@vertix.gg/bot/src/ui/general/help/help-guide-buttons";

import {
    HelpDashboardButton,
    HelpWebsiteButton
} from "@vertix.gg/bot/src/ui/general/help/help-links-buttons";

import { HelpSupportButton } from "@vertix.gg/bot/src/ui/general/help/help-support-button";

export class HelpElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "VertixBot/UI-General/HelpElementsGroup";
    }

    /**
     * Two rows: the guides, then where to go.
     *
     * The guides are ordered as someone meets the bot rather than by importance - set it up,
     * understand what the generator does, turn features on, then the two narrower pages. Five is
     * discord's limit for one row, which is also all the guides worth putting here.
     *
     * The second row answers a different question: somewhere to configure it, somewhere to read
     * about it, and someone to ask. Support sits last because it is what is left when the rest has
     * not helped.
     */
    public static getItems() {
        return [
            [
                HelpSetupGuideButton,
                HelpJoinToCreateButton,
                HelpFeaturesButton,
                HelpLogsChannelButton,
                HelpChannelNamesButton
            ],
            [
                HelpDashboardButton,
                HelpWebsiteButton,
                HelpSupportButton
            ]
        ];
    }
}
