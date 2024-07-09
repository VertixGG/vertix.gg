import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import { DynamicChannelMetaClearChatButton } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/meta/clear-chat/dynamic-channel-meta-clear-chat-button";

import { DynamicChannelMetaLimitButton } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/meta/limit/dynamic-channel-meta-limit-button";

import { DynamicChannelMetaRenameButton } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/meta/rename/dynamic-channel-meta-rename-button";
import {
    DynamicChannelPermissionsAccessButton,
    DynamicChannelPermissionsStateButton,
    DynamicChannelPermissionsVisibilityButton
} from "@vertix.gg/bot/src/ui-v2/dynamic-channel/permissions/elements";
import { DynamicChannelPremiumClaimChannelButton } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/premium/claim/dynamic-channel-premium-claim-channel-button";

import { DynamicChannelPremiumResetChannelButton } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/premium/reset/dynamic-channel-premium-reset-channel-button";
import { DynamicChannelTransferOwnerButton } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/premium/transfer-ownership/dynamic-channel-transfer-owner-button";

import type { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/base/dynamic-channel-button-base";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

type ItemMap = { [ key: string ]: DynamicChannelButtonBase };

/**
 * Represents a group of dynamic channel elements.
 * @extends UIElementsGroupBase
 */
export class DynamicChannelElementsGroup extends UIElementsGroupBase {
    private static allItems: DynamicChannelButtonBase[] = [];
    private static allItemsById: ItemMap = {};
    private static allItemsByName: ItemMap = {};

    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelElementsGroup";
    }

    private static getItemFromMap( map: ItemMap, key: string ): DynamicChannelButtonBase | undefined {
        return map[ key ];
    }

    private static mapElements( allItems: DynamicChannelButtonBase[] ) {
        allItems.forEach( ( item ) => {
            this.allItemsById[ item.getId() ] = item;
            this.allItemsByName[ item.getName() ] = item;
        } );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static getItems( args?: UIArgs ) {
        // TODO: Called 3 times on startup, fix this.
        // @note: This has no visual effect, it used to define the items that will be used in the UI.
        return [
            DynamicChannelMetaRenameButton,
            DynamicChannelMetaLimitButton,
            DynamicChannelMetaClearChatButton,

            DynamicChannelPermissionsStateButton,
            DynamicChannelPermissionsVisibilityButton,
            DynamicChannelPermissionsAccessButton,

            DynamicChannelPremiumResetChannelButton,
            DynamicChannelTransferOwnerButton,
            DynamicChannelPremiumClaimChannelButton,
        ];
    };

    /**
     * Function populate() : Populates the DynamicChannelElementsGroup with items.
     *
     * This method retrieves all items using DynamicChannelElementsGroup.getItems() method,
     * creates new instances of each item, and stores them in the DynamicChannelElementsGroup.allItems array.
     *
     * It checks for duplicate item IDs and throws an error if found.
     */
    public static populate() {
        const allItems = DynamicChannelElementsGroup.getItems().flat().map( ( item ) => new item() ),
            allItemsIds = allItems.map( item => item.getId() );

        allItemsIds.forEach( ( itemId, index ) => {
            delete allItemsIds[ index ];

            if ( allItemsIds.find( ( i ) => i === itemId ) ) {
                throw new Error( `Duplicate item ID: ${ itemId }` );
            }
        } );

        DynamicChannelElementsGroup.allItems = allItems;

        this.mapElements( allItems );
    }

    public static getAllItems() {
        return DynamicChannelElementsGroup.allItems;
    }

    public static getItemById( id: number ) {
        return this.getItemFromMap( this.allItemsById, id.toString() );
    }

    public static getItemByName( name: string ) {
        return this.getItemFromMap( this.allItemsByName, name );
    }

    public static getEmojis( ids: number[] ) {
        const emojis: Promise<string>[] = [];

        ids.forEach( ( id ) => {
            const item = DynamicChannelElementsGroup.getItemById( id );

            if ( item ) {
                emojis.push( item.getEmoji() );
            }
        } );

        return emojis;
    }

    public static sortIds( ids: number[] ) {
        return ids.sort( ( aId: number, bId: number ) =>
            DynamicChannelElementsGroup.getItemById( aId )!.getSortId() -
            DynamicChannelElementsGroup.getItemById( bId )!.getSortId()
        );
    }
}

// TODO: Find better place for this.
DynamicChannelElementsGroup.populate();
