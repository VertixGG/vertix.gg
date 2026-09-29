import { useCommandState } from "@zenflux/react-commander/hooks";

import { DiscordMessage } from "@vertix.gg/discord-ui/src";

import { readDraftProfile } from "@vertix.gg/dashboard/src/features/branding/lib/branding-draft";
import { BRANDING_BOT_IDENTITY } from "@vertix.gg/dashboard/src/features/branding/lib/constants";

import type { BrandingState } from "@vertix.gg/dashboard/src/features/branding/commands";
import type { BrandingDraft } from "@vertix.gg/dashboard/src/features/branding/lib/branding-draft";

function selectDraft( state: BrandingState ): BrandingDraft {
    return {
        nick: state.nick,
        bio: state.bio,
        avatar: state.avatar,
        banner: state.banner
    };
}

/**
 * The bot as a member of this server would meet it, drawn from the form as it is being filled in.
 *
 * Twice, because it is met in two places: the profile card that opens on its name, and a message it
 * sends. A field left empty shows what the bot falls back to - its own name and avatar, no banner and
 * no bio - which is also what every other server goes on seeing.
 *
 * Painted with discord's own tokens, which `DiscordMessage` brings in with it.
 */
export function BrandingPreview() {
    const [ draft ] = useCommandState<BrandingState, BrandingDraft>( "Dashboard/Branding", selectDraft );

    const profile = readDraftProfile( draft ),
        name = profile.nick ?? BRANDING_BOT_IDENTITY.NAME,
        avatar = profile.avatar ?? BRANDING_BOT_IDENTITY.AVATAR_URL;

    return (
        <div className="space-y-3">
            <div className="overflow-hidden rounded-lg shadow-lg bg-[color:var(--discord-background-surface-high)]">
                { profile.banner ? (
                    <img src={ profile.banner } alt="" className="block w-full aspect-[17/6] object-cover" />
                ) : (
                    <div className="w-full aspect-[17/6] bg-[color:var(--discord-brand-500)]" />
                ) }

                <div className="relative px-4 pb-4">
                    <img
                        src={ avatar }
                        alt=""
                        className="absolute -top-10 left-4 w-20 h-20 rounded-full object-cover border-6
                            border-[color:var(--discord-background-surface-high)]
                            bg-[color:var(--discord-background-surface-high)]"
                    />

                    <div className="pt-12">
                        <div className="text-xl font-bold leading-tight break-words
                            text-[color:var(--discord-text-strong)]">
                            { name }
                        </div>

                        <div className="flex items-center text-sm text-[color:var(--discord-text-muted)]">
                            <span>{ BRANDING_BOT_IDENTITY.NAME }</span>
                            <span className="discord-message-bot-tag">App</span>
                        </div>

                        { profile.bio ? (
                            <p className="mt-3 mb-0 text-sm whitespace-pre-wrap break-words
                                text-[color:var(--discord-text-default)]">
                                { profile.bio }
                            </p>
                        ) : null }
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg py-3 bg-[color:var(--discord-background-gradient-chat)]">
                <DiscordMessage author={ name } avatar={ avatar } app>
                    Your voice channel is ready - the controls are below.
                </DiscordMessage>
            </div>
        </div>
    );
}

export default BrandingPreview;
