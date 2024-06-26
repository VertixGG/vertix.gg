
import { UIElementStringSelectMenu } from "@vertix.gg/bot/src/ui-v2/_base/elements/ui-element-string-select-menu";
import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import {
    DynamicChannelElementsGroup
} from "@vertix.gg/bot/src/ui-v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

import type { APISelectMenuOption } from "discord.js";

const allItems = DynamicChannelElementsGroup.getAllItems();

export class ChannelButtonsTemplateSelectMenuBase extends UIElementStringSelectMenu {
    public static getName() {
        return "VertixBot/UI-V2/ButtonsSelectMenuBase";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder(): Promise<string> {
        return "🎚 Select Buttons";
    }

    protected async getMaxValues() {
        return 1;
    }

    protected async getSelectOptions( showUsed?: boolean ) {
        const values = showUsed ? await this.getUsedItems() : await this.getUnusedItems();

        return values.sort( ( a, b ) =>
            parseInt( a.value ) - parseInt( b.value )
        );
    }

    private async getUsedItems() {
        const values: APISelectMenuOption[] = [];

        for ( const itemId of ( this.uiArgs?.dynamicChannelButtonsTemplate || [] ) ) {
            const hardItem = allItems.find( (
                i ) => i.getId() === itemId
            );

            if ( hardItem ) {
                values.push( {
                    label: await hardItem.getLabelForMenu(),
                    emoji: await hardItem.getEmoji() as any,
                    value: hardItem.getId().toString(),
                    default: false,
                } );
            }
        }

        return values;
    }

    private async getUnusedItems() {
        const values: APISelectMenuOption[] = [];

        for ( const item of allItems ) {
            if ( ! this.uiArgs?.dynamicChannelButtonsTemplate.includes( item.getId() ) ) {
                values.push( {
                    label: await item.getLabelForMenu(),
                    emoji: await item.getEmoji() as any,
                    value: item.getId().toString(),
                    default: false,
                } );
            }
        }

        return values;
    }
}

