import { UIComponentBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import { FeedbackReportButton } from "@vertix.gg/bot/src/ui-v2/feedback/elements/feedback-report-button";
import { FeedbackSuggestionButton } from "@vertix.gg/bot/src/ui-v2/feedback/elements/feedback-suggestion-button";
import { FeedbackInviteDeveloperButton } from "@vertix.gg/bot/src/ui-v2/feedback/elements/feedback-invite-developer-button";

import { FeedbackEmbed } from "@vertix.gg/bot/src/ui-v2/feedback/feedback-embed";

import { FeedbackModal } from "@vertix.gg/bot/src/ui-v2/feedback/feedback-modal";
import { FeedbackReportModal } from "@vertix.gg/bot/src/ui-v2/feedback/feedback-report-modal";
import { FeedbackInviteDeveloperModal } from "@vertix.gg/bot/src/ui-v2/feedback/feedback-invite-developer-modal";

import { WelcomeSupportButton } from "@vertix.gg/bot/src/ui-v2/welcome/welcome-support-button";

export class FeedbackComponent extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V2/FeedbackComponent";
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
