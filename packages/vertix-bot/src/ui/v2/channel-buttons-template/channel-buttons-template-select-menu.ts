import { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DynamicChannelElementsGroup } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

const allItems = DynamicChannelElementsGroup.getAll();

export class ChannelButtonsTemplateSelectMenu extends UIElementStringSelectMenu {
    public static getName() {
        return "Vertix/UI-V2/ChannelButtonsTemplateSelectMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder(): Promise<string> {
        return "🎚 Select Buttons";
    }

    protected async getMinValues() {
        return 1;
    }

    protected async getMaxValues() {
        return allItems.length;
    }

    protected async getSelectOptions() {
        const values = allItems.map( async( item ) => {
            const itemId = item.getId();
            // Get the template buttons and ensure we're comparing the same types
            const templateButtons = ( this.uiArgs?.dynamicChannelButtonsTemplate || [] ).map(
                ( id: string | number ) => typeof id === "string" ? parseInt( id ) : id
            );

            return {
                label: await item.getLabelForMenu(),
                value: itemId.toString(),
                emoji: ( await item.getEmoji() ) as any,
                default: templateButtons.includes( itemId )
            };
        } );

        return ( await Promise.all( values ) ).sort(
            ( a, b ) =>
                DynamicChannelElementsGroup.getById( parseInt( a.value ) )!.getSortId() -
                DynamicChannelElementsGroup.getById( parseInt( b.value ) )!.getSortId()
        );
    }
}
