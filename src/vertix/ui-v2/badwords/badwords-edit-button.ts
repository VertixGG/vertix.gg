import { UIElementButtonBase } from "@vertix/ui-v2/_base/elements/ui-element-button-base";
import { UIButtonStyleTypes, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

export class BadwordsEditButton extends UIElementButtonBase {
    public static getName() {
        return "Vertix/UI-V2/SetupBadwordsEditButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getLabel(): Promise<string> {
        return Promise.resolve( "Edit Bad Words" );
    }

    protected getStyle(): Promise<UIButtonStyleTypes> {
        return Promise.resolve( "primary" );
    }

    protected async getEmoji(): Promise<string> {
        return "🙅";
    }
}
