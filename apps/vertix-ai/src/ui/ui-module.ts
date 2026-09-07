import { fileURLToPath } from "url";

import { UIModuleBase } from "@vertix.gg/gui/src/bases/ui-module-base";
import { UICustomIdHashStrategy } from "@vertix.gg/gui/src/ui-custom-id-strategies/ui-custom-id-hash-strategy";

import { PromptAdapter } from "@vertix.gg/ai/src/ui/prompt/prompt-adapter";
import { TriggerAdapter } from "@vertix.gg/ai/src/ui/trigger/trigger-adapter";

export class UIModuleAI extends UIModuleBase {
    public static getName() {
        return "VertixAI/UI/Module";
    }

    public static getSourcePath() {
        return fileURLToPath( import.meta.url );
    }

    public static getAdapters() {
        return [ PromptAdapter, TriggerAdapter ];
    }

    public static getFlows() {
        return [];
    }

    public static getSystemFlows() {
        return [];
    }

    protected getCustomIdStrategy() {
        return new UICustomIdHashStrategy();
    }
}

export default UIModuleAI;
