import { UIModuleBase } from "@vertix.gg/gui/src/bases/ui-module-base";

import { UICustomIdPlainStrategy } from "@vertix.gg/gui/src/ui-custom-id-strategies/ui-custom-id-plain-strategy";

import { FeedbackAdapter } from "@vertix.gg/bot/src/ui/general/feedback/feedback-adapter";

export class UIModuleGeneral extends UIModuleBase {
    public static getName() {
        return "VertixBot/UI-General/Module";
    }

    public static getAdapters() {
        return [ FeedbackAdapter ];
    }

    protected getCustomIdStrategy() {
        return new UICustomIdPlainStrategy();
    }

}

export default UIModuleGeneral;