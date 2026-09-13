import React from "react";

import { DiscordFlowSimulator, DiscordAppFrame } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import { DYNAMIC_CHANNEL_V3_EMOJI_NAMES } from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

import { DEMO_CHANNEL_NAME, DEMO_MEMBERS, DEMO_OWNER, DYNAMIC_CHANNEL_V3_EMOJIS, DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";
import { DynamicChannelV3Emoji } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-emoji";
import { DynamicChannelV3Sidebar } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-sidebar";

/**
 * The words the report uses, named by the tokens the embed defines them as.
 *
 * Every one of these is the bot's own text - "(__restored__)", "🌐 **Public**", "Unlimited" - so
 * the page says which of them applies and the embed supplies the wording.
 */
const RESTORED = "{changedDisplay}",
    UNCHANGED = "{unchangedDisplay}",
    LIMIT_UNLIMITED = "{userLimitUnlimited}",
    STATE_PUBLIC = "{statePublic}",
    VISIBILITY_SHOWN = "{visibilityStateShown}",
    NOT_RATE_LIMITED = "{rateLimitedNone}";

/** What a channel is when the bot hands it to you, which is what reset puts back. */
const DEFAULTS = {
    name: DEMO_CHANNEL_NAME,
    limit: 0,
    privacy: "public",
    region: "Automatic",
    trusted: [] as ReadonlyArray<string>
};

/** How the channel has been left before anybody presses anything. */
const CUSTOMISED = {
    name: "🎮 Gaming Room",
    limit: 4,
    privacy: "private",
    region: "Rotterdam",
    trusted: [ "Alex" ] as ReadonlyArray<string>
};

const CHANNEL_MEMBERS = [ DEMO_MEMBERS.owner, DEMO_MEMBERS.alex, DEMO_MEMBERS.jordan ];

const UNLIMITED_LABEL = "Unlimited";

export default function ResetChannel() {
    const [ runKey, setRunKey ] = React.useState( 0 );

    const [ guidance, setGuidance ] = React.useState<{ title: React.ReactNode; body?: React.ReactNode } | null>( null );

    /**
     * The channel as it stands, which starts out thoroughly meddled with.
     *
     * Reset is only legible against something to undo - a channel already at its defaults reports
     * a column of "unchanged" and looks like it did nothing, which is the second thing worth
     * seeing here rather than the first.
     */
    const [ channel, setChannel ] = React.useState( CUSTOMISED );

    const handleReset = () => {
        setChannel( CUSTOMISED );
        setRunKey( ( key ) => key + 1 );
    };

    /** Which of the two words each line of the report gets, asked of what is actually different. */
    const changed = ( isDifferent: boolean ) => isDifferent ? RESTORED : UNCHANGED;

    return (
        <div className="mb-12">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center">
                    <DynamicChannelV3Emoji
                        name={ DYNAMIC_CHANNEL_V3_EMOJI_NAMES.resetChannel }
                        alt="Reset"
                        fallback="🔃"
                        className="text-h2 mr-4"
                    />
                    <h3 className="mb-0">Reset Channel</h3>
                </div>

                <button
                    type="button"
                    onClick={ handleReset }
                    className="inline-flex items-center whitespace-nowrap rounded-md border border-white/15
                        bg-white/5 px-4 py-2 text-h5 transition-colors hover:bg-white/10"
                >
                    Reset the demo
                </button>
            </div>
            <div className="grid grid-cols-12 gap-12">
                <div className="col-span-12">
                    <div className="mb-4">
                        <div className="text-h5 text-vc-ice-dim">
                            <p className="mb-3">
                                <strong>
                                    Reset puts every setting back the way the bot hands a channel to you, and then
                                    tells you line by line what it had to put back. The channel below has been
                                    thoroughly meddled with — try it.
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
                                        name: channel.name,
                                        active: true,
                                        locked: "private" === channel.privacy,
                                        userCount: CHANNEL_MEMBERS.length,
                                        maxUsers: channel.limit || undefined,
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
                                        resetEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.resetChannel,
                                        name: channel.name,
                                        limit: channel.limit ? String( channel.limit ) : UNLIMITED_LABEL,
                                        region: channel.region,
                                        state: "private" === channel.privacy ? "🚫 Private" : "🌐 Public"
                                    }
                                } }
                                allowedElements={ [ "VertixBot/UI-V3/DynamicChannelResetChannelButton" ] }
                                author="VoiceChannels"
                                avatar={ VertixAvatar }
                                interactionUser={ DEMO_OWNER }
                                guidance={ {
                                    "VertixBot/UI-V3/DynamicChannelFlow/States/Default": DEFAULTS.name === channel.name
                                        ? {
                                            title: "Everything is back where it started",
                                            body: <>
                                                Press <b>( 🔃 Reset )</b> again — with nothing left to undo, every line
                                                of the report says so. The report is honest, not decorative.
                                            </>
                                        }
                                        : {
                                            title: <>Press <b>( 🔃 Reset )</b> — it is lit up for you</>,
                                            body: "The channel has a name, a limit, a padlock and a region that are not the ones it was given. Watch the list beside it."
                                        },
                                    Success: {
                                        title: "Back to default, with the receipt",
                                        body: <>
                                            Every line says whether it had to put that one back. There is no
                                            confirmation step — <b>Reset</b> does it the moment you press it.
                                        </>
                                    },
                                    VoteRequired: { title: "Resetting is a premium feature, unlocked by voting" },
                                    Error: { title: "Something went wrong on Discord's side" }
                                } }
                                steps={ {
                                    // Pressing the panel's button runs the reset there and then -
                                    // the bot answers the press itself rather than putting a
                                    // confirmation up - so this resolves the moment it is reached.
                                    "VertixBot/UI-V3/DynamicChannelResetChannelFlow/States/Default": {
                                        values: () => ( {} ),
                                        toVariables: (): Readonly<Record<string, string>> => ( {
                                            name: DEFAULTS.name,
                                            nameChanged: changed( DEFAULTS.name !== channel.name ),
                                            userLimit: LIMIT_UNLIMITED,
                                            userLimitChanged: changed( DEFAULTS.limit !== channel.limit ),
                                            state: STATE_PUBLIC,
                                            stateChanged: changed( DEFAULTS.privacy !== channel.privacy ),
                                            visibilityState: VISIBILITY_SHOWN,
                                            visibilityStateChanged: UNCHANGED,
                                            region: DEFAULTS.region,
                                            regionChanged: changed( DEFAULTS.region !== channel.region ),
                                            primaryMessageChanged: UNCHANGED,
                                            allowedUsers: "None",
                                            allowedUsersChanged: changed( 0 !== channel.trusted.length ),
                                            blockedUsers: "None",
                                            blockedUsersChanged: UNCHANGED,
                                            rateLimited: NOT_RATE_LIMITED
                                        } ),
                                        onTransition: () => setChannel( DEFAULTS )
                                    }
                                } }
                            />
                        </DiscordAppFrame>
                    </div>

                    <div className="text-h5 text-vc-ice-dim">
                        <p className="mb-0">
                            Reset leaves the channel itself alone — nobody is removed and nothing is deleted. It is the
                            settings that go back: the name, the limit, the privacy, the region, the trusted and
                            blocked lists, and the panel&apos;s own wording.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
