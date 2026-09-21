import { DISCORD_APP_ID } from "@vertix.gg/website/src/vertix/shared/discord-app";

/**
 * What each button asks Discord for.
 *
 * `recommended` is the same set as the bot's own invite button, the bot list listings and the app's
 * default install settings in Discord's developer portal, so however someone arrives they are asked
 * for the same thing. It is everything the bot uses and nothing else - `ViewAuditLog` is the one
 * addition over `minimal`, and it is what lets the bot record who invited it.
 *
 * `minimal` drops that, and is otherwise identical.
 *
 * Neither is Administrator, which this page used to recommend. Administrator satisfies every
 * permission check the bot makes, so a server granting it hides any permission the bot asks for but
 * was never given - which is exactly how a set the bot could not actually run on shipped unnoticed
 * and cost a server. Anyone who wants to grant it can still do so from Discord's own role settings
 * after inviting; it is not something to ask a server owner for by default, and bot list reviewers
 * mark it down.
 */
const INVITE_PERMISSIONS = {
    recommended: "286354576",
    minimal: "286354448"
} as const;

export const onAddToServerClick = ( type: keyof typeof INVITE_PERMISSIONS ) => {
    // @ts-ignore
    window.gtag( "event", "conversion", { "send_to": "AW-993508183" } );

    // @ts-ignore
    window.gtag( "event", "add_to_server", { type, "send_to": "G-B87MBQLL99" } );

    window.open(
        `https://discord.com/oauth2/authorize?client_id=${ DISCORD_APP_ID }` +
        `&permissions=${ INVITE_PERMISSIONS[ type ] }&scope=bot%20applications.commands`
    );
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
