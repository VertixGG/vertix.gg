import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class DynamicChannelTemplatesDeleteConfirmButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelTemplatesDeleteConfirmButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public getId(): string {
        return "templates-delete-confirm";
    }

    public async getLabel() {
        return "Confirm Delete";
    }

    protected getStyle(): Promise<UIButtonStyleTypes> {
        return Promise.resolve( "danger" );
    }

    protected async isDisabled(): Promise<boolean> {
        return !this.uiArgs?.selectedTemplateId;
    }
}






