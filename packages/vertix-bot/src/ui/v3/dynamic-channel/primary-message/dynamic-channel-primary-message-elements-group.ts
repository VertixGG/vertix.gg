import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import { DynamicChannelClaimChannelButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/claim/dynamic-channel-claim-channel-button";

import { DynamicChannelClearChatButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/clear-chat/dynamic-channel-clear-chat-button";

import { DynamicChannelLimitMetaButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/limit/dynamic-channel-limit-meta-button";

import { DynamicChannelRenameButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/rename/dynamic-channel-rename-button";

import { DynamicChannelResetChannelButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/reset/dynamic-channel-reset-channel-button";

import { DynamicChannelTransferOwnerButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/transfer-ownership/dynamic-channel-transfer-owner-button";

import { DynamicChannelPrimaryMessageEditButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/dynamic-channel-primary-message-edit-button";

import { DynamicChannelRegionButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/region/dynamic-channel-region-button";

import { DynamicChannelPrivacyButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/privacy/dynamic-channel-privacy-button";
import { DynamicChannelPermissionsAccessButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/permissions/elements";

import type { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-button-base";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

type ButtonsMap = { [key: string]: DynamicChannelButtonBase };

/**
 * Represents a group of dynamic channel elements.
 * @extends UIElementsGroupBase
 */
export class DynamicChannelPrimaryMessageElementsGroup extends UIElementsGroupBase {
    private static allButtons: DynamicChannelButtonBase[] = [];
    private static allButtonsById: ButtonsMap = {};
    private static allButtonsByName: ButtonsMap = {};

    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelPrimaryMessageElementsGroup";
    }

    private static getItemFromMap( map: ButtonsMap, key: string ): DynamicChannelButtonBase | undefined {
        return map[ key ];
    }

    private static mapButtons( allItems: DynamicChannelButtonBase[] ) {
        allItems.forEach( ( item ) => {
            const itemId = item.getId();

            this.allButtonsById[ itemId ] = item;
            this.allButtonsByName[ item.getName() ] = item;
        } );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static getItems( args?: UIArgs ) {
        // TODO: Called 3 times on startup, fix this.
        // @note: This has no visual effect, it used to define the items that will be used in the UI.
        // Then another function sort it before printing it, TODO Handle it.
        return [
            DynamicChannelRenameButton,
            DynamicChannelLimitMetaButton,
            DynamicChannelPrivacyButton,
            DynamicChannelPermissionsAccessButton,
            DynamicChannelRegionButton,

            DynamicChannelPrimaryMessageEditButton,
            DynamicChannelClearChatButton,
            DynamicChannelResetChannelButton,
            DynamicChannelTransferOwnerButton,
            DynamicChannelClaimChannelButton
        ].sort( ( a, b ) => a.getSortId() - b.getSortId() );
    }

    /**
     * Function `populate()`: Populates the DynamicChannelPrimaryMessageElementsGroup with items.
     *
     * This method retrieves all items using DynamicChannelPrimaryMessageElementsGroup.getItems() method,
     * creates new instances of each item, and stores them in the DynamicChannelPrimaryMessageElementsGroup.allItems array.
     *
     * It checks for duplicate item IDs and throws an error if found.
     */
    public static populate() {
        // If already populated, throw an error.
        if ( this.allButtons.length ) {
            throw new Error( `${ this.getName() } already populated` );
        }

        const dynamicChannelButtons = DynamicChannelPrimaryMessageElementsGroup.getItems().flat();

        dynamicChannelButtons.forEach( ( DynamicChannelButton ) => {
            const button = new DynamicChannelButton();

            if (
                this.allButtons.find( ( item ) => item.getId() === button.getId() || item.getName() === button.getName() )
            ) {
                throw new Error( `Duplicate item id: '${ button.getId() }' name: '${ button.getName() }'` );
            }

            this.allButtons.push( button );
        } );

        this.allButtons = this.sort( this.allButtons );

        this.mapButtons( this.allButtons );
    }

    public static getAll() {
        return DynamicChannelPrimaryMessageElementsGroup.allButtons;
    }

    public static getById( id: string ) {
        // Use the getItemFromMap method directly with the id
        return this.getItemFromMap( this.allButtonsById, id );
    }

    public static getByName( name: string ) {
        return this.getItemFromMap( this.allButtonsByName, name );
    }

    public static async getEmojis( ids: string[] ) {
        const emojis: string[] = [];

        await Promise.all(
            ids.map( async( id ) => {
                const item = DynamicChannelPrimaryMessageElementsGroup.getById( id );

                if ( item ) {
                    emojis.push( await item.getEmoji() );
                }
            } )
        );

        return emojis;
    }

    public static getEmbedEmojis( ids: string[] ) {
        const emojis: string[] = [];

        ids.forEach( ( id ) => {
            const item = DynamicChannelPrimaryMessageElementsGroup.getById( id );

            if ( item ) {
                emojis.push( item.getEmojiForEmbed() );
            }
        } );

        return emojis;
    }

    public static sort( buttons: DynamicChannelButtonBase[] ) {
        return buttons.sort(
            ( a: DynamicChannelButtonBase, b: DynamicChannelButtonBase ) => a.$$.getSortId() - b.$$.getSortId()
        );
    }

    public static sortIds( ids: string[] ) {
        if ( !ids ) {
            return [];
        }

        if ( !Array.isArray( ids ) ) {
            return ids;
        }

        if ( ids.length === 0 ) {
            return ids;
        }

        try {
            const result = ids.sort(
                ( aId: string, bId: string ) => {
                    const aItem = DynamicChannelPrimaryMessageElementsGroup.getById( aId );
                    const bItem = DynamicChannelPrimaryMessageElementsGroup.getById( bId );

                    if ( !aItem || !bItem ) {
                        return 0;
                    }

                    return aItem.$$.getSortId() - bItem.$$.getSortId();
                }
            );

            return result;
        } catch {
            // Return unsorted array if there's an error
            return ids;
        }
    }
}

// TODO: Find better place for this.
DynamicChannelPrimaryMessageElementsGroup.populate();
