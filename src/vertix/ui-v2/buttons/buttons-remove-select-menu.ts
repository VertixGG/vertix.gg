import { ButtonsSelectMenuBase } from "@vertix/ui-v2/buttons/buttons-select-menu-base";

export class ButtonsRemoveSelectMenu extends ButtonsSelectMenuBase {
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
