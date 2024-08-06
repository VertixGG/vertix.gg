import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { FeedbackReportButton } from "@vertix.gg/bot/src/ui/general/feedback/elements/feedback-report-button";
import { FeedbackSuggestionButton } from "@vertix.gg/bot/src/ui/general/feedback/elements/feedback-suggestion-button";
import { FeedbackInviteDeveloperButton } from "@vertix.gg/bot/src/ui/general/feedback/elements/feedback-invite-developer-button";

import { FeedbackEmbed } from "@vertix.gg/bot/src/ui/general/feedback/feedback-embed";

import { FeedbackModal } from "@vertix.gg/bot/src/ui/general/feedback/feedback-modal";
import { FeedbackReportModal } from "@vertix.gg/bot/src/ui/general/feedback/feedback-report-modal";
import { FeedbackInviteDeveloperModal } from "@vertix.gg/bot/src/ui/general/feedback/feedback-invite-developer-modal";

import { WelcomeSupportButton } from "@vertix.gg/bot/src/ui/general/welcome/welcome-support-button";

export class FeedbackComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-General/FeedbackComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    public static getElements() {
        return [
            [ FeedbackReportButton, FeedbackSuggestionButton, WelcomeSupportButton ],
            [ FeedbackInviteDeveloperButton ]
        ];
    }

    public static getEmbeds() {
        return [
            FeedbackEmbed,
        ];
    }

    public static getModals() {
        return [
            FeedbackModal,
            FeedbackReportModal,
            FeedbackInviteDeveloperModal,
        ];
    }
}
