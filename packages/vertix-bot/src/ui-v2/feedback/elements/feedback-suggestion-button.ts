import { UIElementButtonBase } from "@vertix.gg/bot/src/ui-v2/_base/elements/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import type { UIButtonStyleTypes} from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

export class FeedbackSuggestionButton extends UIElementButtonBase {
    public static getName() {
        return "Vertix/UI-V2/FeedbackSuggestionButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    protected getStyle(): Promise<UIButtonStyleTypes> {
        return Promise.resolve( "secondary" );
    }

    protected async getLabel() {
        return "Suggest Your Idea";
    }

    protected async getEmoji() {
        return "💡";
    }
}
