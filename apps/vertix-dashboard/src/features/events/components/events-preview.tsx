import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";

import { BRANDING_BOT_IDENTITY } from "@vertix.gg/dashboard/src/features/branding/lib/constants";

import { buildEventsExamplePreview } from "@vertix.gg/dashboard/src/features/events/lib/events-example";

import type {
    IEventsExampleNames,
    TEventsPreviewState
} from "@vertix.gg/dashboard/src/features/events/lib/events-example";
import type { GuildEventsSettings } from "@vertix.gg/dashboard/src/features/events/types";

interface EventsPreviewProps {
    state: TEventsPreviewState;
    settings: GuildEventsSettings;
    names: IEventsExampleNames;
}

/**
 * What members see in Discord at one moment of the example evening - drawn from the bot's own
 * exported screens, so it is the board the bot posts, in the server's timing and with its pings.
 */
export function EventsPreview( { state, settings, names }: EventsPreviewProps ) {
    const preview = buildEventsExamplePreview( state, settings, names );

    return (
        <div className="rounded-lg overflow-x-auto p-3 bg-[color:var(--discord-background-gradient-chat)]">
            { preview.notPosted ? (
                <p className="text-sm text-[color:var(--discord-text-muted)] px-2 py-6 mb-0 text-center">{ preview.notPosted }</p>
            ) : (
                <DiscordUIComponentMessage
                    author={ BRANDING_BOT_IDENTITY.NAME }
                    avatar={ BRANDING_BOT_IDENTITY.AVATAR_URL }
                    timestamp="Today"
                    componentName={ preview.componentName }
                    variables={ preview.variables }
                    mentions={ preview.mentions }
                    mentioned={ false }
                    elementOverrides={ preview.isJoinClosed
                        ? { "VertixBot/UI-General/EventJoinVoiceButton": { disabled: true } }
                        : undefined }
                />
            ) }
        </div>
    );
}

export default EventsPreview;
