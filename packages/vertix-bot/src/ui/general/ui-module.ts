import { UIModuleBase } from "@vertix.gg/gui/src/bases/ui-module-base";

import { UICustomIdPlainStrategy } from "@vertix.gg/gui/src/ui-custom-id-strategies/ui-custom-id-plain-strategy";

import { SetupAdapter } from "@vertix.gg/bot/src/ui/general/setup/setup-adapter";
import { WelcomeAdapter } from "@vertix.gg/bot/src/ui/general/welcome/welcome-adapter";
import { FeedbackAdapter } from "@vertix.gg/bot/src/ui/general/feedback/feedback-adapter";
import { LanguageAdapter } from "@vertix.gg/bot/src/ui/general/language/language-adapter";
import { NotYourChannelAdapter } from "@vertix.gg/bot/src/ui/general/not-your-channel/not-your-channel-adapter";
import { WelcomeFlow } from "@vertix.gg/bot/src/ui/general/welcome/welcome-flow";

export class UIModuleGeneral extends UIModuleBase {
    public static getName() {
        return "VertixBot/UI-General/Module";
    }

    public static getAdapters() {
        return [ FeedbackAdapter, LanguageAdapter, SetupAdapter, WelcomeAdapter, NotYourChannelAdapter ];
    }

    public static getFlows() {
        return [ WelcomeFlow ];
    }

    protected getCustomIdStrategy() {
        return new UICustomIdPlainStrategy();
    }
}

export default UIModuleGeneral;
