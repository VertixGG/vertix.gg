import { fileURLToPath } from "url";

import { UIModuleBase } from "@vertix.gg/gui/src/bases/ui-module-base";

import { UICustomIdPlainStrategy } from "@vertix.gg/gui/src/ui-custom-id-strategies/ui-custom-id-plain-strategy";

import { SetupFlow } from "@vertix.gg/bot/src/ui/general/setup/setup-flow";

import { SetupAdapter } from "@vertix.gg/bot/src/ui/general/setup/setup-adapter";
import { WelcomeAdapter } from "@vertix.gg/bot/src/ui/general/welcome/welcome-adapter";
import { FeedbackAdapter } from "@vertix.gg/bot/src/ui/general/feedback/feedback-adapter";
import { LanguageAdapter } from "@vertix.gg/bot/src/ui/general/language/language-adapter";
import { NotYourChannelAdapter } from "@vertix.gg/bot/src/ui/general/not-your-channel/not-your-channel-adapter";
import { WelcomeFlow } from "@vertix.gg/bot/src/ui/general/welcome/welcome-flow";
import { CommandsFlow } from "@vertix.gg/bot/src/ui/general/flows/commands-flow";
import { GuildFlow } from "@vertix.gg/bot/src/ui/general/flows/guild-flow";
import { HelpFlow } from "@vertix.gg/bot/src/ui/general/help/help-flow";

export class UIModuleGeneral extends UIModuleBase {
    public static getName() {
        return "VertixBot/UI-General/Module";
    }

    public static getSourcePath() {
        return fileURLToPath( import.meta.url );
    }

    public static getAdapters() {
        return [ FeedbackAdapter, LanguageAdapter, SetupAdapter, WelcomeAdapter, NotYourChannelAdapter ];
    }

    public static getFlows() {
        return [ WelcomeFlow, SetupFlow, HelpFlow ];
    }

    public static getSystemFlows() {
        return [ CommandsFlow, GuildFlow ];
    }

    protected getCustomIdStrategy() {
        return new UICustomIdPlainStrategy();
    }
}

export default UIModuleGeneral;
