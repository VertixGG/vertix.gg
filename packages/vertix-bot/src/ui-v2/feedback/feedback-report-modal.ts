import { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { FeedbackInputTitle } from "@vertix.gg/bot/src/ui-v2/feedback/modal-elements/feedback-input-title";
import { FeedbackInputDescription } from "@vertix.gg/bot/src/ui-v2/feedback/modal-elements/feedback-input-description";

export class FeedbackReportModal extends UIModalBase {
    public static getName() {
        return "VertixBot/UI-V2/FeedbackReportModal";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    protected getTitle() {
        return "Submit a issue";
    }

    public static getInputElements() {
        return [
            [ FeedbackInputTitle ],
            [ FeedbackInputDescription ],
        ];
    }
}
