import { fileURLToPath } from "url";

import { UIModuleBase } from "@vertix.gg/gui/src/bases/ui-module-base";

import { UICustomIdPlainStrategy } from "@vertix.gg/gui/src/ui-custom-id-strategies/ui-custom-id-plain-strategy";

import { LanguageFlow } from "@vertix.gg/bot/src/ui/general/language/language-flow";

import { SetupAdapter } from "@vertix.gg/bot/src/ui/general/setup/setup-adapter";
import { WelcomeAdapter } from "@vertix.gg/bot/src/ui/general/welcome/welcome-adapter";
import { FeedbackAdapter } from "@vertix.gg/bot/src/ui/general/feedback/feedback-adapter";
import { LanguageAdapter } from "@vertix.gg/bot/src/ui/general/language/language-adapter";
import { NotYourChannelAdapter } from "@vertix.gg/bot/src/ui/general/not-your-channel/not-your-channel-adapter";
import { WelcomeFlow } from "@vertix.gg/bot/src/ui/general/welcome/welcome-flow";
import { CommandsFlow } from "@vertix.gg/bot/src/ui/general/flows/commands-flow";
import { GuildFlow } from "@vertix.gg/bot/src/ui/general/flows/guild-flow";
import { HelpFlow } from "@vertix.gg/bot/src/ui/general/help/help-flow";
import { SetupFlow } from "@vertix.gg/bot/src/ui/general/setup/setup-flow";
import { WelcomeController } from "@vertix.gg/bot/src/controllers/welcome-controller";

import type { UIControllerBase } from "@vertix.gg/gui/src/bases/ui-controller-base";

type ControllerClassConstructor = new ( options: any ) => UIControllerBase<any>;

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
        return [ WelcomeFlow, SetupFlow, HelpFlow, LanguageFlow ];
    }

    public static getSystemFlows() {
        return [ CommandsFlow, GuildFlow ];
    }

    /**
     * Returns the Controller classes associated with this module.
     */
    public static override getControllers(): ControllerClassConstructor[] {
        return [ WelcomeController as unknown as ControllerClassConstructor ];
    }

    protected getCustomIdStrategy() {
        return new UICustomIdPlainStrategy();
    }
}

export default UIModuleGeneral;
