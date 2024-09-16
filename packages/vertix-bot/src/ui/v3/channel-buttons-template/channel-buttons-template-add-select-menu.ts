import { ChannelButtonsTemplateSelectMenuBase } from "@vertix.gg/bot/src/ui/v3/channel-buttons-template/channel-buttons-template-select-menu-base";

import { DynamicChannelPrimaryMessageElementsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/dynamic-channel-primary-message-elements-group";

export class ChannelButtonsTemplateAddSelectMenu extends ChannelButtonsTemplateSelectMenuBase {
    public static getName() {
        return "Vertix/UI-V3/ButtonsAddSelectMenu";
    }

    protected async getPlaceholder(): Promise<string> {
        return "＋ Add Button";
    }

    protected async getSelectOptions() {
        return super.getSelectOptions( false );
    }

    protected async isAvailable(): Promise<boolean> {
        return Object.keys( this.uiArgs?.dynamicChannelButtonsTemplate || {} ).length
            !== DynamicChannelPrimaryMessageElementsGroup.getAll().length;
    }
}
