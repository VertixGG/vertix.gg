import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class DynamicChannelTemplatesApplyButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelTemplatesApplyButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public getId() {
        return "templates-apply";
    }

    public async getLabel() {
        return "Apply Template";
    }

    public async getEmoji() {
        return EmojiManager.$.getMarkdown( "ChannelTemplates" );
    }

    protected getStyle(): Promise<UIButtonStyleTypes> {
        return Promise.resolve( "secondary" );
    }

    protected async isDisabled(): Promise<boolean> {
        const templates = this.uiArgs?.templates ?? [];

        return templates.length === 0;
    }
}

