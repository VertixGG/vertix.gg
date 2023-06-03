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

import { UIElementsGroupBase } from "@vertix/ui-v2/_base/ui-elements-group-base";
import { DynamicChannelButtonBase } from "@vertix/ui-v2/dynamic-channel/base/dynamic-channel-button-base";

import { UIArgs } from "@vertix/ui-v2/_base/ui-definitions";

export class DynamicChannelElementsGroup extends UIElementsGroupBase {
    private static allItems: DynamicChannelButtonBase[];

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
    }

    public static getAllItems() {
        return DynamicChannelElementsGroup.allItems;
    }
}

// TODO: Find better place for this.
DynamicChannelElementsGroup.ensureItems();
