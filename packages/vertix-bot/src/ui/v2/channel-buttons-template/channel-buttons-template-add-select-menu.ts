import { ChannelButtonsTemplateSelectMenuBase } from "@vertix.gg/bot/src/ui/v2/channel-buttons-template/channel-buttons-template-select-menu-base";

import { DynamicChannelElementsGroup } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

export class ChannelButtonsTemplateAddSelectMenu extends ChannelButtonsTemplateSelectMenuBase {
    public static getName() {
        return "Vertix/UI-V2/ButtonsAddSelectMenu";
    }

    protected async getPlaceholder(): Promise<string> {
        return "＋ Add Button";
    }

    protected async getSelectOptions() {
        return super.getSelectOptions( false );
    }

    protected async isAvailable(): Promise<boolean> {
        return (
            Object.keys( this.uiArgs?.dynamicChannelButtonsTemplate || {} ).length !==
            DynamicChannelElementsGroup.getAll().length
        );
    }
}
