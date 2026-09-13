import React from "react";

import { DiscordFlowSimulator, DiscordAppFrame } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import { DYNAMIC_CHANNEL_V3_EMOJI_NAMES } from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

import { DEMO_CHANNEL_NAME, DEMO_MEMBERS, DEMO_OWNER, DYNAMIC_CHANNEL_V3_EMOJIS, DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";
import { DynamicChannelV3Emoji } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-emoji";
import { DynamicChannelV3Sidebar } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-sidebar";

/** What a channel runs on until somebody says otherwise, and what the bot recommends. */
const AUTOMATIC_REGION = "Automatic";

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

    const picked = AUTOMATIC_REGION !== region;

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
                    <h3 className="mb-0">Region</h3>
                </div>

                <button
                    type="button"
                    onClick={ () => {
                        setRegion( AUTOMATIC_REGION );
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
                                    The region is where your channel&apos;s voice server sits. Discord picks one for
                                    you; you can pin it somewhere closer to the people actually talking. Try it below.
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
                                        region
                                    }
                                } }
                                allowedElements={ [ "VertixBot/UI-V3/DynamicChannelRegionButton" ] }
                                author="VoiceChannels"
                                avatar={ VertixAvatar }
                                interactionUser={ DEMO_OWNER }
                                guidance={ {
                                    "VertixBot/UI-V3/DynamicChannelFlow/States/Default": {
                                        title: <>Press <b>( 🌍 Region )</b> — it is lit up for you</>,
                                        body: `Your channel is on ${ AUTOMATIC_REGION }, which is where Discord puts one to begin with.`
                                    },
                                    // One state, so what there is to say about it depends on
                                    // whether anything has been picked yet rather than on where
                                    // the flow stands - it never leaves this state.
                                    "VertixBot/UI-V3/DynamicChannelRegionFlow/States/Default": picked
                                        ? {
                                            title: <>Your channel now runs through <b>{ region }</b></>,
                                            body: <>
                                                The message rewrote itself in place, and the panel above agrees with it.
                                                Pick another, or go back to <b>{ AUTOMATIC_REGION }</b> — which is the
                                                one to leave it on unless everybody is in the same part of the world.
                                            </>
                                        }
                                        : {
                                            title: "Pick a region from the menu",
                                            body: <>
                                                There are fourteen, and the bot recommends leaving it
                                                on <b>{ AUTOMATIC_REGION }</b> — it follows the people in the channel.
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
                                            }
                                        },
                                        onTransition: ( _transitionName, values ) => {
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
