import { DynamicChannelMetaRenameButton } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/meta/rename/dynamic-channel-meta-rename-button";
import { DynamicChannelMetaLimitButton } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/meta/limit/dynamic-channel-meta-limit-button";
import { DynamicChannelMetaClearChatButton } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/meta/clear-chat/dynamic-channel-meta-clear-chat-button";
import {
    DynamicChannelPermissionsAccessButton,
    DynamicChannelPermissionsStateButton,
    DynamicChannelPermissionsVisibilityButton
} from "@vertix.gg/bot/src/ui-v2/dynamic-channel/permissions/elements";

import { DynamicChannelPremiumResetChannelButton } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/premium/reset/dynamic-channel-premium-reset-channel-button";
import { DynamicChannelPremiumClaimChannelButton } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/premium/claim/dynamic-channel-premium-claim-channel-button";
import { DynamicChannelTransferOwnerButton } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/premium/transfer-ownership/dynamic-channel-transfer-owner-button";

import { UIElementsGroupBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-elements-group-base";

import type { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/base/dynamic-channel-button-base";

import type { UIArgs } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

export class DynamicChannelElementsGroup extends UIElementsGroupBase {
    private static allItems: DynamicChannelButtonBase[];
    private static allItemsObjects: { [ key: string ]: DynamicChannelButtonBase } = {};

    public static getName() {
        return "Vertix/UI-V2/DynamicChannelElementsGroup";
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
}

// TODO: Find better place for this.
DynamicChannelElementsGroup.ensureItems();
