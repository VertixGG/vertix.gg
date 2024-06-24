import {
    ChannelButtonsTemplateSelectMenuBase
} from "@vertix.gg/bot/src/ui-v2/channel-buttons-template/channel-buttons-template-select-menu-base";

export class ChannelButtonsTemplateRemoveSelectMenu extends ChannelButtonsTemplateSelectMenuBase {
    public static getName() {
        return "Vertix/UI-V2/ButtonsRemoveSelectMenu";
    }

    protected async getPlaceholder(): Promise<string> {
        return "✖ Remove Button";
    }

    protected async getSelectOptions() {
        return super.getSelectOptions( true );
    }

    protected async isAvailable(): Promise<boolean> {
        return Object.keys( this.uiArgs?.dynamicChannelButtonsTemplate || {} ).length > 0;
    }
}
