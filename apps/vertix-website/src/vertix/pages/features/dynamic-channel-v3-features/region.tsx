import React from "react";

import { DiscordFlowSimulator, DiscordAppFrame } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc-avatar.webp";

import { DYNAMIC_CHANNEL_V3_EMOJI_NAMES } from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

import { DEMO_CHANNEL_NAME, DEMO_MEMBERS, DEMO_OWNER, DYNAMIC_CHANNEL_V3_EMOJIS, DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";
import { DynamicChannelV3Emoji } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-emoji";
import { DynamicChannelV3Sidebar } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-sidebar";

/** What a channel runs on until somebody says otherwise, and what the bot recommends. */
const AUTOMATIC_REGION = "Automatic";

/**
 * The bitrate a channel is born at, in the kilobits the embed prints rather than the bits the api
 * takes - this is a demonstration of what a reader sees, and nobody reads `64000`.
 *
 * A generator hands its own bitrate down to every channel it makes, so a channel nobody has touched
 * is on whatever the generator is on. 64 is discord's own default for a fresh voice channel.
 */
const INHERITED_BITRATE = "64";

/** The option that means no choice of the owner's, which resolves back to the generator's own. */
const INHERIT_OPTION_VALUE = "inherit";

/** Both menus sit in one state, so the transition is what tells which of them was used. */
const BITRATE_TRANSITION = "VertixBot/UI-V3/DynamicChannelRegionFlow/Transitions/SelectBitrate";

/**
 * Function readBitrateOption() :: The number an option on the bitrate menu stands for.
 *
 * The menu is labelled in kilobits and valued in bits - `64 kbps` against `64000` - and the embed
 * prints the kilobits, so the label is what is carried across. `Generator default` is the one option
 * that is not a number at all, and stands for whatever the generator is on.
 */
function readBitrateOption( label: string, value: string ) {
    if ( INHERIT_OPTION_VALUE === value ) {
        return INHERITED_BITRATE;
    }

    return label.replace( " kbps", "" );
}

const CHANNEL_MEMBERS = [ DEMO_MEMBERS.owner, DEMO_MEMBERS.alex, DEMO_MEMBERS.jordan ];

export default function Region() {
    const [ runKey, setRunKey ] = React.useState( 0 );

    const [ guidance, setGuidance ] = React.useState<{ title: React.ReactNode; body?: React.ReactNode } | null>( null );

    /**
     * Where the channel's voice server is, as the embed prints it.
     *
     * The bot works `region` out once and hands it to whichever message is drawing, so the panel
     * and the region message read the same thing - which is why it lives here rather than inside
     * the simulator.
     */
    const [ region, setRegion ] = React.useState( AUTOMATIC_REGION );

    /** How much of everyone's connection the channel asks for, as the same embed prints it. */
    const [ bitrate, setBitrate ] = React.useState( INHERITED_BITRATE );

    const picked = AUTOMATIC_REGION !== region;

    const raised = INHERITED_BITRATE !== bitrate;

    return (
        <div className="mb-12">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center">
                    <DynamicChannelV3Emoji
                        name={ DYNAMIC_CHANNEL_V3_EMOJI_NAMES.region }
                        alt="Region"
                        fallback="🌍"
                        className="text-h2 mr-4"
                    />
                    <h2 className="text-h3 mb-0">Region & Bitrate</h2>
                </div>

                <button
                    type="button"
                    onClick={ () => {
                        setRegion( AUTOMATIC_REGION );
                        setBitrate( INHERITED_BITRATE );
                        setRunKey( ( key ) => key + 1 );
                    } }
                    className="inline-flex items-center whitespace-nowrap rounded-md border border-white/15
                        bg-white/5 px-4 py-2 text-h5 transition-colors hover:bg-white/10"
                >
                    Reset
                </button>
            </div>
            <div className="grid grid-cols-12 gap-12">
                <div className="col-span-12">
                    <div className="mb-4">
                        <div className="text-h5 text-vc-ice-dim">
                            <p className="mb-3">
                                <strong>
                                    One screen for the two things that decide how your channel sounds. The region is
                                    where its voice server sits — Discord picks one for you, and you can pin it closer
                                    to the people actually talking. The bitrate is how much of everyone&apos;s
                                    connection it asks for. Try both below.
                                </strong>
                            </p>

                            { guidance && (
                                <p className="mb-0">
                                    <strong className="text-vc-ice">{ guidance.title }</strong>
                                    { guidance.body && <> — { guidance.body }</> }
                                </p>
                            ) }
                        </div>
                    </div>

                    <div className="mb-6">
                        <DiscordAppFrame
                            channelName={ DEMO_CHANNEL_NAME }
                            sidebar={
                                <DynamicChannelV3Sidebar
                                    channel={ {
                                        name: DEMO_CHANNEL_NAME,
                                        active: true,
                                        timer: "26:08",
                                        users: CHANNEL_MEMBERS
                                    } }
                                />
                            }
                        >
                            <DiscordFlowSimulator
                                key={ runKey }
                                onGuidance={ setGuidance }
                                entry={ {
                                    flowName: "VertixBot/UI-V3/DynamicChannelFlow",
                                    stateKey: "VertixBot/UI-V3/DynamicChannelFlow/States/Default",
                                    componentName: "VertixBot/UI-V3/DynamicChannel",
                                    mentionUser: DEMO_OWNER,
                                    variables: {
                                        ...DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES,
                                        regionEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.region,
                                        region,
                                        bitrate
                                    }
                                } }
                                allowedElements={ [ "VertixBot/UI-V3/DynamicChannelRegionButton" ] }
                                author="VoiceChannels"
                                avatar={ VertixAvatar }
                                interactionUser={ DEMO_OWNER }
                                guidance={ {
                                    "VertixBot/UI-V3/DynamicChannelFlow/States/Default": {
                                        title: <>Press <b>( 🌍 Region )</b> — it is lit up for you</>,
                                        body: `Your channel is on ${ AUTOMATIC_REGION } at ${ INHERITED_BITRATE } kbps, which is where it starts.`
                                    },
                                    // One state, so what there is to say about it depends on
                                    // what has been picked so far rather than on where the flow
                                    // stands - it never leaves this state.
                                    "VertixBot/UI-V3/DynamicChannelRegionFlow/States/Default": picked || raised
                                        ? {
                                            title: <>Your channel runs through <b>{ region }</b> at <b>{ bitrate } kbps</b></>,
                                            body: <>
                                                The message rewrote itself in place, and the panel above agrees with it.
                                                Leave the region on <b>{ AUTOMATIC_REGION }</b> unless everybody is in the
                                                same part of the world, and remember a higher bitrate asks more of
                                                everyone&apos;s connection — <b>Generator default</b> hands both back.
                                            </>
                                        }
                                        : {
                                            title: "Two menus, and you can use either",
                                            body: <>
                                                Fourteen regions above, audio quality below. The bot recommends leaving
                                                the region on <b>{ AUTOMATIC_REGION }</b> — it follows the people in the
                                                channel — and only the servers with boosts are offered the steps
                                                past <b>96 kbps</b>.
                                            </>
                                        }
                                } }
                                steps={ {
                                    "VertixBot/UI-V3/DynamicChannelRegionFlow/States/Default": {
                                        menus: {
                                            // The fourteen regions are the bot's own list, declared
                                            // on the menu; what is carried across is the name it
                                            // prints for one, not the value underneath it.
                                            "VertixBot/UI-V3/DynamicChannelRegionSelectMenu": {
                                                valuesFromOption: ( option ) => ( { region: option.label ?? "" } )
                                            },
                                            // Every step the bot declares, including the ones a
                                            // server needs a boost for. The export is the whole
                                            // list precisely so a page like this can show it.
                                            "VertixBot/UI-V3/DynamicChannelBitrateSelectMenu": {
                                                valuesFromOption: ( option ) => ( {
                                                    bitrate: readBitrateOption( option.label ?? "", option.value ?? "" )
                                                } )
                                            }
                                        },
                                        // Both menus live in this one state, so which of them was
                                        // used is read off the transition rather than off the
                                        // values - a menu that was not touched carries nothing.
                                        onTransition: ( transitionName, values ) => {
                                            if ( BITRATE_TRANSITION === transitionName ) {
                                                setBitrate( values.bitrate );

                                                return;
                                            }

                                            setRegion( values.region );
                                        }
                                    }
                                } }
                            />
                        </DiscordAppFrame>
                    </div>
                </div>
            </div>
        </div>
    );
}
