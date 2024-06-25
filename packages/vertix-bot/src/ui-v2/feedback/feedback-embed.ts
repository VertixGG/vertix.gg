import { UIEmbedBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-embed-base";
import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

export class FeedbackEmbed extends UIEmbedBase {
    public static getName() {
        return "Vertix/UI-V2/FeedbackEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    protected getColor() {
        return VERTIX_DEFAULT_COLOR_BRAND;
    }

    protected getTitle() {
        return "Appreciating your experience with Vertix";
    }

    protected getDescription() {
        return "We want to thank you for your time and patience.\n\n" +
            "**Your experience with Vertix is important to us, and we would love to hear your feedback.**\n\n" +
            "We strive to provide the best possible service, and your input can help us achieve that.\n\n" +
            "If you have any suggestions, concerns, or ideas on how we can improve Vertix, please don't hesitate to share them with us.\n\n" +
            "Your feedback is highly appreciated and will contribute to making Vertix even better.\n\n" +
            "Thank you for using Vertix, and we look forward to hearing your thoughts!";
    }
}
