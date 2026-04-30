import { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DynamicChannelPrimaryMessageElementsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/dynamic-channel-primary-message-elements-group";

const allItems = DynamicChannelPrimaryMessageElementsGroup.getAll();

export class ChannelButtonsTemplateSelectMenu extends UIElementStringSelectMenu {
    public static getName() {
        return "VertixBot/UI-V3/ChannelButtonsTemplateSelectMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder(): Promise<string> {
        return "🎚 Select Buttons";
    }

    protected async getMinValues() {
        return 0;
    }

    protected async getMaxValues() {
        return allItems.length;
    }

    protected async getSelectOptions() {
        const values = allItems.map( async( item ) => {
            const emojiRaw = await item.getEmoji();
            const match = /^<a?:([^:>]+):(\d+)>$/.exec( emojiRaw );

            const emoji = match
                ? {
                    id: match[ 2 ],
                    name: match[ 1 ],
                    animated: emojiRaw.startsWith( "<a:" )
                }
                : ( emojiRaw.trim().length ? { name: emojiRaw } : undefined );

            return {
                label: await item.getLabelForMenu(),
                value: item.getId().toString(),
                ...( emoji ? { emoji } : {} ),
                default: ( this.uiArgs?.dynamicChannelButtonsTemplate || [] ).includes( item.getId() )
            };
        } );

        return ( await Promise.all( values ) ).sort(
            ( a, b ) =>
                DynamicChannelPrimaryMessageElementsGroup.getById( a.value )!.$$.getSortId() -
                DynamicChannelPrimaryMessageElementsGroup.getById( b.value )!.$$.getSortId()
        );
    }
}
