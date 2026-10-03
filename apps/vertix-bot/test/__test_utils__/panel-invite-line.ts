import process from "process";

import { jest } from "@jest/globals";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import type { APIEmbed } from "discord.js";

import type { UIAdapterBuildSource, UIArgs, UIMessageOptions } from "@vertix.gg/gui/src/bases/ui-definitions";

const GUILD_ID = "820000000000000001",
    CALLBACK_URL = "https://api.voicechannels.online/api/install/callback";

/** What the interface editor left a panel's embed saying - its override replaces the description outright. */
export const EDITED_DESCRIPTION = "Rewritten in the interface editor";

interface IPanelAdapter {
    getComponent(): { getSchema(): object };
    onAfterBuild( args: UIArgs ): Promise<void>;
    getMessage( from: UIAdapterBuildSource, context: object, argsFromManager: UIArgs ): UIMessageOptions;
}

/**
 * Function drawPanelDescription() :: What a panel adapter posts as its description, over a build the
 * interface editor has already had its say in.
 *
 * Stood up off the prototype, so none of the adapter's wiring has to exist. The component is replaced by
 * the schema a build leaves behind - which is where the editor's overrides end up - and what is under
 * test is what the adapter adds to it after that.
 *
 * Counting installs is switched on for the drawing, so the link says which panel it came from.
 */
export async function drawPanelDescription(
    Adapter: { prototype: object },
    isPro: boolean,
    description: string = EDITED_DESCRIPTION
) {
    const callbackUrl = process.env.INSTALL_CALLBACK_URL;

    process.env.INSTALL_CALLBACK_URL = CALLBACK_URL;

    jest.spyOn( ServiceLocator, "$", "get" ).mockReturnValue( {
        get: () => ( { canBrand: async() => isPro } )
    } as never );

    const adapter = Object.create( Adapter.prototype ) as IPanelAdapter;

    adapter.getComponent = () => ( {
        getSchema: () => ( {
            type: "component",
            entities: { embeds: [ { attributes: { description } } ] }
        } )
    } );

    try {
        await adapter.onAfterBuild( { _guildId: GUILD_ID } );

        const message = adapter.getMessage( "send", { guildId: GUILD_ID }, {} );

        return ( message.embeds?.[ 0 ] as APIEmbed | undefined )?.description;
    } finally {
        process.env.INSTALL_CALLBACK_URL = callbackUrl;
    }
}
