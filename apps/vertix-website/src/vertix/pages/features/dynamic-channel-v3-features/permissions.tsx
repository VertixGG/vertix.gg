import React from "react";

import { DiscordFlowSimulator, DiscordAppFrame } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import { DYNAMIC_CHANNEL_V3_EMOJI_NAMES } from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

import { DEMO_CHANNEL_NAME, DEMO_MEMBERS, DEMO_OWNER, DYNAMIC_CHANNEL_V3_EMOJIS, DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";
import { DynamicChannelV3Emoji } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-emoji";
import { DynamicChannelV3Sidebar } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-sidebar";

import type { DiscordFlowSimulatorMenuOption } from "@vertix.gg/discord-ui";

/**
 * The room, and who in it holds what.
 *
 * One of them carries a staff role, because the interesting half of this feature is what it refuses
 * to do: a server's staff keep their way into every channel whatever its owner decides.
 */
interface Member {
    id: string;
    name: string;
    avatar: string;
    owner?: boolean;
    staff?: boolean;
}

const MEMBERS: ReadonlyArray<Member> = [
    { id: "owner", name: DEMO_OWNER, avatar: DEMO_MEMBERS.owner.avatar, owner: true },
    { id: "alex", name: "Alex", avatar: DEMO_MEMBERS.alex.avatar },
    { id: "jordan", name: "Jordan", avatar: DEMO_MEMBERS.jordan.avatar },
    { id: "mia", name: "Mia", avatar: DEMO_MEMBERS.mia.avatar, staff: true }
];

const OTHERS = MEMBERS.filter( ( member ) => !member.owner );

// What the bot prints where a list is empty, which is how both lists start out.
const NO_TRUSTED = "Currently there are no trusted users.\n",
    NO_BLOCKED = "Currently there are no blocked users.\n";

/** The lists the embeds print, built the way the bot builds them - one mention per line. */
function listDisplay( ids: ReadonlyArray<string>, empty: string ): string {
    if ( !ids.length ) {
        return empty;
    }

    return ids
        .map( ( id ) => `- <@${ MEMBERS.find( ( member ) => member.id === id )?.name ?? id }>\n` )
        .join( "" );
}

export default function Permissions() {
    // Who is in the channel, who is trusted, who is blocked. The bot asks a service these three
    // things; a demonstration has to be the service, and the flow's own conditions are asked of
    // the answers rather than of anything this page decides.
    const [ room, setRoom ] = React.useState<ReadonlyArray<string>>( MEMBERS.map( ( member ) => member.id ) );

    const [ trusted, setTrusted ] = React.useState<ReadonlyArray<string>>( [] );

    const [ blocked, setBlocked ] = React.useState<ReadonlyArray<string>>( [] );

    const [ runKey, setRunKey ] = React.useState( 0 );

    const [ guidance, setGuidance ] = React.useState<{ title: React.ReactNode; body?: React.ReactNode } | null>( null );

    const handleReset = () => {
        setRoom( MEMBERS.map( ( member ) => member.id ) );
        setTrusted( [] );
        setBlocked( [] );
        setRunKey( ( key ) => key + 1 );
    };

    const inRoom = MEMBERS.filter( ( member ) => room.includes( member.id ) );

    const option = ( member: Member, values: Readonly<Record<string, string>> ): DiscordFlowSimulatorMenuOption => ( {
        label: member.name,
        description: member.staff ? "Holds a staff role" : undefined,
        icon: member.avatar,
        values: { memberId: member.id, ...values }
    } );

    return (
        <div className="mb-12">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center">
                    <DynamicChannelV3Emoji
                        name={ DYNAMIC_CHANNEL_V3_EMOJI_NAMES.permissions }
                        alt="Permissions"
                        fallback="👥"
                        className="text-h2 mr-4"
                    />
                    <h3 className="mb-0">Permissions</h3>
                </div>

                <button
                    type="button"
                    onClick={ handleReset }
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
                                    Permissions is five menus over one list of people: who you trust, who you have shut
                                    out, and who is in the room right now. Try it below — every menu is live, and the
                                    channel beside it keeps up.
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
                                        users: inRoom.map( ( member ) => ( {
                                            id: member.id,
                                            username: member.name,
                                            avatar: member.avatar
                                        } ) )
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
                                        permissionsEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.permissions,
                                        allowedUsersDisplay: listDisplay( trusted, NO_TRUSTED ),
                                        blockedUsersDisplay: listDisplay( blocked, NO_BLOCKED )
                                    }
                                } }
                                allowedElements={ [ "VertixBot/UI-V3/DynamicChannelPermissionsAccessButton" ] }
                                author="VoiceChannels"
                                avatar={ VertixAvatar }
                                interactionUser={ DEMO_OWNER }
                                guidance={ {
                                    "VertixBot/UI-V3/DynamicChannelFlow/States/Default": {
                                        title: <>Press <b>( 👥 Access )</b> — it is lit up for you</>,
                                        body: "The panel opens a second one, which only you can see."
                                    },
                                    "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Default": {
                                        title: "Five menus, one list of people",
                                        body: <>
                                            Start with <b>👍 Grant Access</b> and pick <b>Alex</b> — then work down the
                                            menus. Every one of them names the same room.
                                        </>
                                    },
                                    Granted: {
                                        title: "Trusted — they can get in however the channel is set",
                                        body: <>
                                            The answer carries the menus and the new list together, so you go straight
                                            on. Try <b>👎 Remove Access</b> on <b>Jordan</b>, who was never on it.
                                        </>
                                    },
                                    NothingChanged: {
                                        title: "Nothing to revoke — they were never trusted",
                                        body: <>
                                            The bot says so rather than pretending it did something, and puts the panel
                                            back above it. Next, <b>🫵 Block</b> <b>Jordan</b> — watch the channel list.
                                        </>
                                    },
                                    Denied: {
                                        title: "Off the trusted list — back to whatever the channel allows everyone",
                                        body: <>Try <b>🫵 Block</b> next, which is the stronger one.</>
                                    },
                                    Blocked: {
                                        title: "Blocked, and out of the channel",
                                        body: <>
                                            A block takes their access away and removes them from the room. Now try
                                            blocking <b>Mia</b>, who holds a staff role.
                                        </>
                                    },
                                    StaffMember: {
                                        title: "Staff cannot be blocked or kicked out",
                                        body: <>
                                            They keep their way into every dynamic channel, whatever its owner picks.
                                            Now <b>🤙 Un-Block</b> somebody to let them back.
                                        </>
                                    },
                                    Unblocked: {
                                        title: "Un-blocked — they can come back in",
                                        body: <>
                                            Last one: <b>👢 Kick</b> somebody. A kick puts them out of the room without
                                            taking anything away.
                                        </>
                                    },
                                    Kicked: {
                                        title: "Out of the channel, free to come back",
                                        body: "That is the difference between a kick and a block."
                                    },
                                    Error: { title: "Something went wrong on Discord's side" }
                                } }
                                steps={ {
                                    "VertixBot/UI-V3/DynamicChannelPermissionsFlow/States/Default": {
                                        menus: {
                                            // Discord offers the whole server in these menus, so
                                            // taking access from somebody who never had it is a
                                            // thing you can do - and the flow has an answer for it.
                                            "VertixBot/UI-V3/DynamicChannelPermissionsGrantMenu": {
                                                options: OTHERS.map( ( member ) => option( member, {
                                                    userGrantedDisplayName: member.name
                                                } ) )
                                            },
                                            "VertixBot/UI-V3/DynamicChannelPermissionsDenyMenu": {
                                                options: OTHERS.map( ( member ) => option( member, {
                                                    userDeniedDisplayName: member.name,
                                                    inTheList: trusted.includes( member.id ) ? "yes" : "no"
                                                } ) )
                                            },
                                            "VertixBot/UI-V3/DynamicChannelPermissionsBlockMenu": {
                                                options: inRoom
                                                    .filter( ( member ) => !member.owner )
                                                    .map( ( member ) => option( member, {
                                                        userBlockedDisplayName: member.name,
                                                        staffMemberDisplayName: member.name,
                                                        staff: member.staff ? "yes" : "no"
                                                    } ) )
                                            },
                                            "VertixBot/UI-V3/DynamicChannelPermissionsUnblockMenu": {
                                                options: OTHERS.map( ( member ) => option( member, {
                                                    userUnBlockedDisplayName: member.name,
                                                    inTheList: blocked.includes( member.id ) ? "yes" : "no"
                                                } ) )
                                            },
                                            "VertixBot/UI-V3/DynamicChannelPermissionsKickMenu": {
                                                options: inRoom
                                                    .filter( ( member ) => !member.owner )
                                                    .map( ( member ) => option( member, {
                                                        userKickedDisplayName: member.name,
                                                        staffMemberDisplayName: member.name,
                                                        staff: member.staff ? "yes" : "no"
                                                    } ) )
                                            }
                                        },
                                        // Only what the bot actually did reaches the lists and the room.
                                        onTransition: ( transitionName, values ) => {
                                            const id = values.memberId;

                                            const without = ( ids: ReadonlyArray<string> ) =>
                                                ids.filter( ( item ) => item !== id );

                                            switch ( transitionName ) {
                                                case "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/GrantSuccess":
                                                    setTrusted( ( ids ) => ids.includes( id ) ? ids : [ ...ids, id ] );
                                                    break;

                                                case "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/DenySuccess":
                                                    setTrusted( without );
                                                    break;

                                                case "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/BlockSuccess":
                                                    setBlocked( ( ids ) => ids.includes( id ) ? ids : [ ...ids, id ] );
                                                    setTrusted( without );
                                                    setRoom( without );
                                                    break;

                                                case "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/UnblockSuccess":
                                                    setBlocked( without );
                                                    break;

                                                case "VertixBot/UI-V3/DynamicChannelPermissionsFlow/Transitions/KickSuccess":
                                                    setRoom( without );
                                                    break;
                                            }
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
