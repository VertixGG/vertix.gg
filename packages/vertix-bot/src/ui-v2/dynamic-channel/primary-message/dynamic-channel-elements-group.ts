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

type ButtonsMap = { [ key: string ]: DynamicChannelButtonBase };

/**
 * Represents a group of dynamic channel elements.
 * @extends UIElementsGroupBase
 */
export class DynamicChannelElementsGroup extends UIElementsGroupBase {
    private static allButtons: DynamicChannelButtonBase[] = [];
    private static allButtonsById: ButtonsMap = {};
    private static allButtonsByName: ButtonsMap = {};

    public static getName() {
        return "Vertix/UI-V2/DynamicChannelElementsGroup";
    }

    private static getItemFromMap( map: ButtonsMap, key: string ): DynamicChannelButtonBase | undefined {
        return map[ key ];
    }

    private static mapButtons( allItems: DynamicChannelButtonBase[] ) {
        allItems.forEach( ( item ) => {
            this.allButtonsById[ item.getId() ] = item;
            this.allButtonsByName[ item.getName() ] = item;
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
        // If already populated, throw an error.
        if ( this.allButtons.length ) {
            throw new Error( `${ this.getName() } already populated` );
        }

        const dynamicChannelButtons = DynamicChannelElementsGroup.getItems().flat();

        dynamicChannelButtons.forEach( ( DynamicChannelButton ) => {
            const button = new DynamicChannelButton();

            if ( this.allButtons.find( ( item ) =>
                item.getId() === button.getId() || item.getName() === button.getName() )
            ) {
                throw new Error( `Duplicate item id: '${ button.getId() }' name: '${ button.getName() }'` );
            }

            this.allButtons.push( button );
        } );

        this.allButtons = this.sort( this.allButtons );

        this.mapButtons( this.allButtons );
    }

    public static getAll() {
        return DynamicChannelElementsGroup.allButtons;
    }

    public static getById( id: number ) {
        return this.getItemFromMap( this.allButtonsById, id.toString() );
    }

    public static getByName( name: string ) {
        return this.getItemFromMap( this.allButtonsByName, name );
    }

    public static async getEmojis( ids: number[] ) {
        const emojis: string[] = [];

        await Promise.all( ids.map( async ( id ) => {
            const item = DynamicChannelElementsGroup.getById( id );

            if ( item ) {
                emojis.push( ( await item.getEmoji() ) );
            }
        } ) );

        return emojis;
    }

    public static getEmbedEmojis( ids: number[] ) {
        const emojis: string[] = [];

        ids.forEach( id => {
            const item = DynamicChannelElementsGroup.getById( id );

            if ( item ) {
                emojis.push( item.getEmojiForEmbed() );
            }
        } );

        return emojis;
    }

    public static sort( buttons: DynamicChannelButtonBase[] ) {
        return buttons.sort( ( a: DynamicChannelButtonBase, b: DynamicChannelButtonBase ) =>
            a.getSortId() - b.getSortId()
        );
    };

    public static sortIds( ids: number[] ) {
        return ids.sort( ( aId: number, bId: number ) =>
            DynamicChannelElementsGroup.getById( aId )!.getSortId() -
            DynamicChannelElementsGroup.getById( bId )!.getSortId()
        );
    }
}

// TODO: Find better place for this.
DynamicChannelElementsGroup.populate();
