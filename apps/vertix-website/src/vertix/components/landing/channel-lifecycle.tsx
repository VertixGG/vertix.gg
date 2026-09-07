import React from "react";

import "./channel-lifecycle.css";

/**
 * The product's whole loop, playing on repeat: someone joins the one channel
 * you set up, gets a channel of their own, friends fill it, everyone leaves,
 * it deletes itself.
 *
 * Every cast member stays mounted for the whole cycle and is toggled through
 * `data-present`, so leaving animates as well as joining — React would drop the
 * node before an exit transition could run if the list were rendered from
 * `step.present` directly.
 */

interface CastMember {
    id: string;
    name: string;
    /** Drives the avatar ring and initial; one of the four brand neons. */
    accent: string;
}

const CAST: readonly CastMember[] = [
    { id: "ari", name: "Ari", accent: "var(--color-vc-crimson)" },
    { id: "juno", name: "Juno", accent: "var(--color-vc-azure)" },
    { id: "kai", name: "Kai", accent: "var(--color-vc-mint)" },
];

interface Step {
    /** Cast ids inside the temporary channel at this beat. */
    present: readonly string[];
    caption: string;
    ms: number;
}

const STEPS: readonly Step[] = [
    { present: [], caption: "One channel sits in your list. Nothing else.", ms: 2200 },
    { present: [ "ari" ], caption: "Ari joins it — and gets a channel of their own", ms: 1900 },
    { present: [ "ari", "juno" ], caption: "Friends drop in", ms: 1500 },
    { present: [ "ari", "juno", "kai" ], caption: "Ari runs it: rename, lock, set a limit", ms: 2800 },
    { present: [ "ari", "juno" ], caption: "Kai heads off", ms: 1300 },
    { present: [ "ari" ], caption: "Juno follows", ms: 1300 },
    { present: [], caption: "Empty — so the channel deletes itself", ms: 2400 },
];

/** The beat the animation freezes on when motion is turned down. */
const RESTING_STEP = 3;

function usePrefersReducedMotion() {
    const [ reduced, setReduced ] = React.useState( false );

    React.useEffect( () => {
        const query = window.matchMedia( "(prefers-reduced-motion: reduce)" ),
            sync = () => setReduced( query.matches );

        sync();
        query.addEventListener( "change", sync );

        return () => query.removeEventListener( "change", sync );
    }, [] );

    return reduced;
}

const SpeakerIcon: React.FC = () => (
    <svg className="vc-lifecycle__icon" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        strokeLinejoin="round" aria-hidden="true">
        <path d="M11 5 6 9H2v6h4l5 4V5z"/>
        <path d="M15.5 8.5a5 5 0 0 1 0 7"/>
        <path d="M19 5a10 10 0 0 1 0 14"/>
    </svg>
);

export const ChannelLifecycle: React.FC = () => {
    const reduced = usePrefersReducedMotion(),
        [ index, setIndex ] = React.useState( 0 );

    const step = STEPS[ reduced ? RESTING_STEP : index ] ?? STEPS[ 0 ]!;

    React.useEffect( () => {
        if ( reduced ) {
            return;
        }

        const timer = setTimeout(
            () => setIndex( ( current ) => ( current + 1 ) % STEPS.length ),
            step.ms
        );

        return () => clearTimeout( timer );
    }, [ index, reduced, step.ms ] );

    const isOpen = step.present.length > 0,
        // The generator lights up on the beat where someone walks into it.
        isGeneratorHot = ! reduced && index === 1;

    return (
        <figure className="vc-lifecycle" aria-label="How a temporary voice channel is created and removed">
            <div className="vc-lifecycle__panel">
                <p className="vc-lifecycle__group">Voice Channels</p>

                <div className="vc-lifecycle__channel vc-lifecycle__channel--generator"
                    data-hot={ isGeneratorHot }>
                    <SpeakerIcon/>
                    <span className="vc-lifecycle__name">Join to Create</span>
                    <span className="vc-lifecycle__hint">generator</span>
                </div>

                <div className="vc-lifecycle__slot" data-present={ isOpen }>
                    <div className="vc-lifecycle__slot-inner">
                        <div className="vc-lifecycle__channel vc-lifecycle__channel--temp">
                            <SpeakerIcon/>
                            <span className="vc-lifecycle__name">Ari&rsquo;s Channel</span>
                            <span className="vc-lifecycle__count">{ step.present.length }</span>
                        </div>

                        <ul className="vc-lifecycle__members">
                            { CAST.map( ( member ) => {
                                const present = step.present.includes( member.id );

                                return (
                                    <li key={ member.id }
                                        className="vc-lifecycle__member"
                                        data-present={ present }
                                        style={ { "--vc-member-accent": member.accent } as React.CSSProperties }>
                                        <span className="vc-lifecycle__member-inner">
                                            <span className="vc-lifecycle__avatar">
                                                { member.name.charAt( 0 ) }
                                            </span>
                                            <span className="vc-lifecycle__member-name">{ member.name }</span>
                                            { member.id === "ari" && (
                                                <span className="vc-lifecycle__owner">owner</span>
                                            ) }
                                        </span>
                                    </li>
                                );
                            } ) }
                        </ul>
                    </div>
                </div>
            </div>

            { /* `aria-live` off on purpose — this is decoration that repeats
                forever, and announcing every beat would be hostile. The
                `aria-label` on the figure carries the meaning instead. */ }
            <figcaption className="vc-lifecycle__caption" key={ step.caption }>
                { step.caption }
            </figcaption>
        </figure>
    );
};

export default ChannelLifecycle;
