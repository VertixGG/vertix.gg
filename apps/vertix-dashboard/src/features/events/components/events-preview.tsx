import { useLayoutEffect, useRef, useState } from "react";

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
 * Function useFitToWidth() :: The scale that fits content into the width of the box around it -
 * never above its own size - and the height it takes up at that scale.
 *
 * A Discord message is as wide as Discord draws it, wider than a side column, and cut off or
 * scrolled sideways it stops looking like the message it previews. Scaled, it is the whole message,
 * smaller. The box is measured again whenever it or the content changes size, so a narrower window
 * or another state's longer message is fitted too.
 */
function useFitToWidth() {
    const boxRef = useRef<HTMLDivElement>( null ),
        contentRef = useRef<HTMLDivElement>( null );

    const [ fit, setFit ] = useState( { scale: 1, height: 0 } );

    useLayoutEffect( () => {
        const box = boxRef.current,
            content = contentRef.current;

        if ( ! box || ! content ) {
            return;
        }

        // The content's own size - a transform does not change it, so fitting it never feeds back.
        const measure = () => {
            const scale = Math.min( 1, box.clientWidth / Math.max( 1, content.offsetWidth ) );

            setFit( { scale, height: content.offsetHeight * scale } );
        };

        const observer = new ResizeObserver( measure );

        observer.observe( box );
        observer.observe( content );

        measure();

        return () => observer.disconnect();
    }, [] );

    return { boxRef, contentRef, ... fit };
}

/**
 * What members see in Discord at one moment of the example evening - drawn from the bot's own
 * exported screens, so it is the board the bot posts, in the server's timing and with its pings.
 */
export function EventsPreview( { state, settings, names }: EventsPreviewProps ) {
    const preview = buildEventsExamplePreview( state, settings, names ),
        { boxRef, contentRef, scale, height } = useFitToWidth();

    return (
        <div className="rounded-lg p-3 bg-[color:var(--discord-background-gradient-chat)]">
            <div ref={ boxRef } className="relative overflow-hidden" style={ height ? { height } : undefined }>
                <div ref={ contentRef } className="w-max origin-top-left" style={ { transform: `scale(${ scale })` } }>
                    { preview.notPosted ? (
                        <p className="w-96 max-w-full text-sm text-[color:var(--discord-text-muted)] px-2 py-6 mb-0 text-center">
                            { preview.notPosted }
                        </p>
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
            </div>
        </div>
    );
}

export default EventsPreview;
