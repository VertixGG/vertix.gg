import { fileURLToPath } from "url";

import { UIModuleBase } from "@vertix.gg/gui/src/bases/ui-module-base";
import { UICustomIdHashStrategy } from "@vertix.gg/gui/src/ui-custom-id-strategies/ui-custom-id-hash-strategy";

import { LanguageFlow } from "@vertix.gg/bot/src/ui/general/language/language-flow";

import { SetupAdapter } from "@vertix.gg/bot/src/ui/general/setup/setup-adapter";
import { WelcomeAdapter } from "@vertix.gg/bot/src/ui/general/welcome/welcome-adapter";
import { FeedbackAdapter } from "@vertix.gg/bot/src/ui/general/feedback/feedback-adapter";
import { LanguageAdapter } from "@vertix.gg/bot/src/ui/general/language/language-adapter";
import { NotYourChannelAdapter } from "@vertix.gg/bot/src/ui/general/not-your-channel/not-your-channel-adapter";
import { NoActiveDynamicChannelAdapter } from "@vertix.gg/bot/src/ui/general/no-active-dynamic-channel/no-active-dynamic-channel-adapter";
import { AIAgentAdapter } from "@vertix.gg/bot/src/ui/general/ai-agent/ai-agent-adapter";
import { WelcomeFlow } from "@vertix.gg/bot/src/ui/general/welcome/welcome-flow";
import { CommandsFlow } from "@vertix.gg/bot/src/ui/general/flows/commands-flow";
import { GuildFlow } from "@vertix.gg/bot/src/ui/general/flows/guild-flow";
import { SetupFlow } from "@vertix.gg/bot/src/ui/general/setup/setup-flow";
import { SetupNewWizardFlow } from "@vertix.gg/bot/src/ui/v3/setup-new/setup-new-wizard-flow";
import { FeedbackFlow } from "@vertix.gg/bot/src/ui/general/feedback/feedback-flow";

export class UIModuleGeneral extends UIModuleBase {
    public static getName() {
        return "VertixBot/UI-General/Module";
    }

    public static getSourcePath() {
        return fileURLToPath( import.meta.url );
    }

    public static getAdapters() {
        return [ FeedbackAdapter, LanguageAdapter, SetupAdapter, WelcomeAdapter, NotYourChannelAdapter, NoActiveDynamicChannelAdapter, AIAgentAdapter ];
    }

    public static getFlows() {
        return [ WelcomeFlow, SetupFlow, SetupNewWizardFlow, LanguageFlow, FeedbackFlow ];
    }

    public static getSystemFlows() {
        return [ CommandsFlow, GuildFlow ];
    }

    protected getCustomIdStrategy() {
        return new UICustomIdHashStrategy();
    }
}

export default UIModuleGeneral;
