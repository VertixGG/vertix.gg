import { UIModalBase } from "@vertix/ui-v2/_base/ui-modal-base";
import { UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { FeedbackInputUrl } from "@vertix/ui-v2/feedback/modal-elements/feedback-input-url";

export class FeedbackInviteDeveloperModal extends UIModalBase {
    public static getName() {
        return "Vertix/UI-V2/FeedbackInviteDeveloperModal";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    protected getTitle() {
        return "Invite Developer";
    }

    public static getInputElements() {
        return [
            [ FeedbackInputUrl ],
        ];
    }
}
