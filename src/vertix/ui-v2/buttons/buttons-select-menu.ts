import { UIElementStringSelectMenu } from "@vertix/ui-v2/_base/elements/ui-element-string-select-menu";
import { UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import {
    DynamicChannelElementsGroup
} from "@vertix/ui-v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

const allItems = DynamicChannelElementsGroup.getAllItems();

export class ButtonsSelectMenu extends UIElementStringSelectMenu {
    public static getName() {
        return "Vertix/UI-V2/ButtonsSelectMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder(): Promise<string> {
        return "🎚 Select Buttons";
    }

    protected async getMaxValues() {
        return allItems.length;
    }

    protected async getSelectOptions() {
        const values = allItems.map( async ( item ) => {
            return {
                label: await item.getLabelForMenu(),
                value: item.getId().toString(),
                default: ( this.uiArgs?.dynamicChannelButtonsTemplate || [] ).includes( item.getId() ),
            };
        } );

        return await Promise.all( values );
    }
}
