import { UIElementInputBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-input-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIInputStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class AIAgentMessageInput extends UIElementInputBase {
    public static getName() {
        return "VertixBot/UI-General/AIAgentMessageInput";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getStyle(): Promise<UIInputStyleTypes> {
        return "long";
    }

    protected async getLabel(): Promise<string> {
        return "Message";
    }

    protected async getPlaceholder(): Promise<string> {
        return "Type your message...";
    }

    protected async getMinLength(): Promise<number | undefined> {
        return 1;
    }

    protected async getMaxLength(): Promise<number | undefined> {
        return 1900;
    }

    protected async isRequired(): Promise<boolean> {
        return true;
    }
}

