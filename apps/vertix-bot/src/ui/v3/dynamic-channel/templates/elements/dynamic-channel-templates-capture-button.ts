import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class DynamicChannelTemplatesCaptureButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelTemplatesCaptureButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public getId() {
        return "templates-capture";
    }

    public async getLabel() {
        return "Capture Template";
    }

    public async getEmoji() {
        return EmojiManager.$.getMarkdown( "Capture" );
    }

    protected getStyle(): Promise<UIButtonStyleTypes> {
        return Promise.resolve( "secondary" );
    }

    protected async isDisabled(): Promise<boolean> {
        const templates = this.uiArgs?.templates ?? [];
        const maxTemplates = this.uiArgs?.maxTemplates ?? 5;

        return templates.length >= maxTemplates;
    }
}

