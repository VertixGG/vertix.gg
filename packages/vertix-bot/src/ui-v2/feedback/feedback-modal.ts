import { UIModalBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-modal-base";
import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import { FeedbackInputTitle } from "@vertix.gg/bot/src/ui-v2/feedback/modal-elements/feedback-input-title";
import { FeedbackInputDescription } from "@vertix.gg/bot/src/ui-v2/feedback/modal-elements/feedback-input-description";

export class FeedbackModal extends UIModalBase {
    public static getName() {
        return "Vertix/UI-V2/FeedbackModal";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    protected getTitle() {
        return "Submit Feedback";
    }

    public static getInputElements() {
        return [
            [ FeedbackInputTitle ],
            [ FeedbackInputDescription ],
        ];
    }
}
