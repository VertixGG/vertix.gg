import { DynamicChannelMetaRenameButton } from "../meta/rename/dynamic-channel-meta-rename-button";
import { DynamicChannelMetaLimitButton } from "../meta/limit/dynamic-channel-meta-limit-button";
import { DynamicChannelMetaClearChatButton } from "../meta/clear-chat/dynamic-channel-meta-clear-chat-button";
import {
    DynamicChannelPermissionsAccessButton,
    DynamicChannelPermissionsStateButton,
    DynamicChannelPermissionsVisibilityButton
} from "../permissions/elements";

import { DynamicChannelPremiumResetChannelButton } from "../premium/reset/dynamic-channel-premium-reset-channel-button";
import { DynamicChannelPremiumClaimChannelButton } from "../premium/claim/dynamic-channel-premium-claim-channel-button";
import { DynamicChannelTransferOwnerButton } from "../premium/transfer-ownership/dynamic-channel-transfer-owner-button";

import { UIElementsGroupBase } from "@vertix/ui-v2/_base/ui-elements-group-base";
import { DynamicChannelButtonBase } from "@vertix/ui-v2/dynamic-channel/base/dynamic-channel-button-base";

import { UIArgs } from "@vertix/ui-v2/_base/ui-definitions";

export class DynamicChannelElementsGroup extends UIElementsGroupBase {
    private static allItems: DynamicChannelButtonBase[];
    private static allItemsObjects: { [ key: string ]: DynamicChannelButtonBase } = {};

    public static getName() {
        return "Vertix/UI-V2/DynamicChannelElementsGroup";
    }

    public static getItems( args?: UIArgs ) {
        // TODO: Called 3 times on startup, fix this.
        return [
            [
                DynamicChannelMetaRenameButton,
                DynamicChannelMetaLimitButton,
                DynamicChannelMetaClearChatButton,
            ],
            [
                DynamicChannelPermissionsStateButton,
                DynamicChannelPermissionsVisibilityButton,
                DynamicChannelPermissionsAccessButton,
            ],
            [
                DynamicChannelPremiumResetChannelButton,
                DynamicChannelTransferOwnerButton,
                DynamicChannelPremiumClaimChannelButton,
            ]
        ];
    };

    public static ensureItems() {
        const allItems = DynamicChannelElementsGroup.getItems().flat().map( ( item ) => new item() ),
            allItemsIds = allItems.map( item => item.getId() );

        allItemsIds.forEach( ( itemId, index ) => {
            delete allItemsIds[ index ];

            if ( allItemsIds.find( ( i ) => i === itemId ) ) {
                throw new Error( `Duplicate item ID: ${ itemId }` );
            }
        } );

        // @ts-ignore
        DynamicChannelElementsGroup.allItems = allItems;

        allItems.forEach( ( item ) => {
            DynamicChannelElementsGroup.allItemsObjects[ item.getId() ] = item;
        } );
    }

    public static getAllItems() {
        return DynamicChannelElementsGroup.allItems;
    }

    public static getItemById( id: number ) {
        return DynamicChannelElementsGroup.allItemsObjects[ id ];
    }

    public static sortIds( ids: number[] ) {
        return ids.sort( ( aId: number, bId: number ) =>
            DynamicChannelElementsGroup.getItemById( aId ).getSortId() -
            DynamicChannelElementsGroup.getItemById( bId ).getSortId()
        );
    }

    public static async getUsedEmojis( usedButtons: number[] ) {
        return Promise.all(
            this.getAllItems()
                .filter( item => usedButtons.includes( item.getId() ) )
                .map( async ( item ) => item.getEmoji() )
        );
    }
}

// TODO: Find better place for this.
DynamicChannelElementsGroup.ensureItems();
