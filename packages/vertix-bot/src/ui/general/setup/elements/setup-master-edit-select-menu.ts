import { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { ISetupArgs } from "@vertix.gg/bot/src/ui/general/setup/setup-definitions";

export class SetupMasterEditSelectMenu extends UIElementStringSelectMenu<ISetupArgs> {
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
        return [ ... ( this.uiArgs?.masterScalingChannels || [] ).map( ( channel, index ) => {
            return {
                label: `Master Scaling Channel #${ index + 1 }`,
                value: `${ channel.channelId }:${ index }`,
                emoji: { name: "🔧" }
            };
        } ), ... ( this.uiArgs?.masterDynamicChannels || [] ).map( ( channel, index ) => {
            return {
                label: `Master Dynamic Channel #${ index + 1 }`,
                value: `${ channel.channelId }:${ index }`,
                emoji: { name: "🔧" }
            };
        } ) ];
    }

    protected async isAvailable(): Promise<boolean> {
        return ( this.uiArgs?.masterChannels?.length || 0 ) > 0;
    }
}
