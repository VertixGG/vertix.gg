import {
    buildBotInviteUrl
} from "@vertix.gg/definitions/src/discord-invite-definitions";

import type { TDiscordInvitePermissionsType } from "@vertix.gg/definitions/src/discord-invite-definitions";

/**
 * What each button asks Discord for lives in `@vertix.gg/definitions`, beside the app id, since the
 * dashboard offers the same invite from its own "the bot is not in this server" modal and the two
 * asking for different permissions would only show up as a server missing something.
 *
 * This page names no server: it has no idea who is reading it. The dashboard does, and passes one.
 */
export const onAddToServerClick = ( type: TDiscordInvitePermissionsType ) => {
    // @ts-ignore
    window.gtag( "event", "conversion", { "send_to": "AW-993508183" } );

    // @ts-ignore
    window.gtag( "event", "add_to_server", { type, "send_to": "G-B87MBQLL99" } );

    window.open( buildBotInviteUrl( type ) );
};

export default function InviteVertix() {
    return (
        <div className="vc-container vc-page-panel pt-12 text-center">
            <h1 className="text-h2">
                Invite VoiceChannels to your server
            </h1>
            <h2 className="text-center text-h4">
                Select the option that best suits your needs, you can always change the permissions later.
            </h2>
            <div className="grid grid-cols-12 gap-6 p-12">
                <div className="col-span-12 xl:col-span-6">
                    <button onClick={ () => onAddToServerClick( "recommended" ) } className="vc-btn vc-btn-lg vc-btn-cyan vc-btn-effect h-full w-full flex-col gap-1 p-10" type="button">
                        <h3 className="mb-0 text-h4">Recommended Permissions</h3>
                        <p className="mb-0 text-base opacity-80">Everything the bot needs, nothing more</p>
                    </button>
                </div>
                <div className="col-span-12 xl:col-span-6">
                    <button onClick={ () => onAddToServerClick( "minimal" ) } className="vc-btn vc-btn-lg vc-btn-crimson vc-btn-effect h-full w-full flex-col gap-1 p-10" type="button">
                        <h3 className="mb-0 text-h4">Minimal Permissions</h3>
                        <p className="mb-0 text-base opacity-80">The same, without audit log access</p>
                    </button>
                </div>
            </div>
        </div>
    );
}
