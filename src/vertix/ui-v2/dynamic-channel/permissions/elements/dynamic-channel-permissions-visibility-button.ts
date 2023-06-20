import { DynamicChannelButtonBase } from "@vertix/ui-v2/dynamic-channel/base/dynamic-channel-button-base";
import { uiUtilsWrapAsTemplate } from "@vertix/ui-v2/ui-utils";

export class DynamicChannelPermissionsVisibilityButton extends DynamicChannelButtonBase {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelPermissionsVisibilityButton";
    }

    public getId() {
        return 4;
    }

    public getSortId(): number {
        return 4;
    }

    public getLabelForEmbed() {
        return "🙈 ∙ **Hidden** / 🐵 ∙ **Shown**";
    }

    public async getLabelForMenu(): Promise<string> {
        return "Shown/Hidden"; //  - ( 🙈 / 🐵 )
    }

    public async getLabel(): Promise<string> {
        return uiUtilsWrapAsTemplate( "displayText" );
    }

    public getEmoji(): Promise<string> {
        if ( ! this.uiArgs?.isHidden ) {
            return Promise.resolve( "🙈" );
        }

        return Promise.resolve( "🐵" );
    }

    protected getOptions() {
        return {
            shownText: "Shown",
            hiddenText: "Hidden",
        };
    }

    protected async getLogic() {
        const result: any = {};

        if ( this.uiArgs?.isHidden ) {
            result.displayText = uiUtilsWrapAsTemplate( "shownText" );
        } else {
            result.displayText = uiUtilsWrapAsTemplate( "hiddenText" );
        }

        return result;
    }
}
