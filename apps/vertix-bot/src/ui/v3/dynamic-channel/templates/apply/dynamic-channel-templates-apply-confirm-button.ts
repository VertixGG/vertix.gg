import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class DynamicChannelTemplatesApplyConfirmButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelTemplatesApplyConfirmButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public getId() {
        return "templates-apply-confirm";
    }

    public async getLabel() {
        return "Apply Selected";
    }

    public async getEmoji() {
        return EmojiManager.$.getMarkdown( "ChannelTemplates" );
    }

    protected getStyle(): Promise<UIButtonStyleTypes> {
        return Promise.resolve( "success" );
    }

    protected async isDisabled(): Promise<boolean> {
        return !this.uiArgs?.selectedTemplateId;
    }
}

