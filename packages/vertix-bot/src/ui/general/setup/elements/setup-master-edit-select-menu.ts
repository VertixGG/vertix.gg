import { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class SetupMasterEditSelectMenu extends UIElementStringSelectMenu {
    public static getName() {
        return "VertixBot/UI-General/SetupMasterEditSelectMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder(): Promise<string> {
        return "❖ ∙ Edit Master Channel(s)";
    }

    protected async getMinValues() {
        return 0;
    }

    protected async getSelectOptions() {
        return ( this.uiArgs?.masterChannels || [] ).map( ( channel: { channelId: any; }, index: number ) => {
            return {
                label: `Master Channel #${ index + 1 }`,
                value: `${ channel.channelId }:${ index }`,
                emoji: "🔧",
            };
        } );
    }

    protected async isAvailable(): Promise<boolean> {
        return this.uiArgs?.masterChannels?.length > 0;
    }
}
