interface ButtonInterface {
    id: number;
    sortId: number;
    labelForEmbed: string;
    labelForMenu: string;
    emoji: string | string[];
}

interface ButtonDataInterface {
    [ namespace: string ]: ButtonInterface;
}

const BUTTON_INTERFACE_DATA: ButtonDataInterface = {
    "Vertix/UI-V2/DynamicChannelMetaRenameButton": {
        id: 0,
        sortId: 0,
        labelForEmbed: "✏️ ∙ **Rename**",
        labelForMenu: "Rename",
        emoji: "✏️"
    },
    "Vertix/UI-V2/DynamicChannelMetaLimitButton": {
        id: 1,
        sortId: 1,
        labelForEmbed: "✋ ∙ **User Limit**",
        labelForMenu: "Limit",
        emoji: "✋"
    },
    "Vertix/UI-V2/DynamicChannelMetaClearChatButton": {
        id: 2,
        sortId: 2,
        labelForEmbed: "🧹 ∙ **Clear Chat**",
        labelForMenu: "Clear Chat",
        emoji: "🧹"
    },
    "Vertix/UI-V2/DynamicChannelPermissionsStateButton": {
        id: 3,
        sortId: 3,
        labelForEmbed: "🚫 ∙ **Private** / 🌐 ∙ **Public**",
        labelForMenu: "Public/Private",
        emoji: ([ "🚫", "🌐" ] as string[] )
    },
    "Vertix/UI-V2/DynamicChannelPermissionsVisibilityButton": {
        id: 4,
        sortId: 4,
        labelForEmbed: "🙈 ∙ **Hidden** / 🐵 ∙ **Shown**",
        labelForMenu: "Shown/Hidden",
        emoji: ( [ "🙈", "🐵" ] as string[] )
    },
    "Vertix/UI-V2/DynamicChannelPermissionsAccessButton": {
        id: 5,
        sortId: 5,
        labelForEmbed: "👥 ∙ **Access**",
        labelForMenu: "Access",
        emoji: "👥"
    },
    "Vertix/UI-V2/DynamicChannelPremiumResetChannelButton": {
        id: 6,
        sortId: 6,
        labelForEmbed: "🔃 ∙ **Reset**",
        labelForMenu: "Reset",
        emoji: "🔃"
    },
    "Vertix/UI-V2/DynamicChannelTransferOwnerButton": {
        id: 12,
        sortId: 7,
        labelForEmbed: "🔀 ∙ **Transfer**",
        labelForMenu: "Transfer",
        emoji: "🔀"
    },
    "Vertix/UI-V2/DynamicChannelPremiumClaimChannelButton": {
        id: 7,
        sortId: 8,
        labelForEmbed: "😈 ∙ **Claim**",
        labelForMenu: "Claim",
        emoji: "😈"
    },
} as const;

export const DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA: {
    data: ButtonDataInterface,
    dataIdMap: {
        [ id: number ]: ButtonInterface;
    },
    getId: ( namespace: string ) => number;
    getSortId: ( namespace: string ) => number;
    getLabelForEmbed: ( namespace: string ) => string;
    getLabelForMenu: ( namespace: string ) => string;
    getEmoji: ( namespace: string ) => string | string[];
    getById: ( id: number ) => ButtonInterface;
    getAllIds: () => number[];
    getUsedEmojis: ( ids: number[] ) => string[];
} = {
    data: {},
    dataIdMap: {},

    getId: ( namespace: string ): number => {
        return DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA.data[ namespace ].id;
    },

    getSortId: ( namespace: string ): number => {
        return DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA.data[ namespace ].sortId;
    },

    getLabelForEmbed: ( namespace: string ): string => {
        return DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA.data[ namespace ].labelForEmbed;
    },

    getLabelForMenu: ( namespace: string ): string => {
        return DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA.data[ namespace ].labelForMenu;
    },

    getEmoji: ( namespace: string ): string | string[] => {
        return DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA.data[ namespace ].emoji;
    },

    getById: ( id: number ): ButtonInterface => {
        return DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA.dataIdMap[ id ];
    },

    getAllIds: (): number[] => {
        return Object.values( DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA.data ).map( ( { id } ) => id );
    },

    getUsedEmojis: ( ids: number[] ): string[] => {
        const usedEmojis: string[] = [];

        for ( const id of ids ) {
            const { emoji } = DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA.getById( id );

            if ( Array.isArray( emoji ) ) {
                usedEmojis.push( emoji[ 0 ] );
            } else {
                usedEmojis.push( emoji );
            }
        }

        // TODO: Cache the result for specific ids.

        return usedEmojis;
    },
};

( () => {
    const idSet = new Set();
    const sortIdSet = new Set();

    for ( const namespace in BUTTON_INTERFACE_DATA ) {
        const { id, sortId } = BUTTON_INTERFACE_DATA[ namespace ];

        if ( idSet.has( id ) ) {
            throw new Error( `Duplicate id found for namespace '${ namespace }': '${ id }'` );
        }

        if ( sortIdSet.has( sortId ) ) {
            throw new Error( `Duplicate sortId found for namespace '${ namespace }': '${ sortId }'` );
        }

        DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA.dataIdMap[ id ] = BUTTON_INTERFACE_DATA[ namespace ];

        idSet.add( id );
        sortIdSet.add( sortId );
    }

    DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA.data = BUTTON_INTERFACE_DATA;
} )();
