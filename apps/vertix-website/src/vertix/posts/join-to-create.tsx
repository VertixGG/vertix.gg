import { DiscordAppFrame, DiscordChannelList, DiscordCommandSuggestion, DiscordMessage, DiscordUIComponentMessage } from "@vertix.gg/discord-ui";

import VertixAvatar from "@vertix.gg/assets/brand/vc-avatar.png";

import { useOpenDynamicChannelV3Feature } from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

import {
    DEMO_CHANNEL_NAME,
    DEMO_MEMBERS,
    DEMO_OWNER,
    DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES
} from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";

import type { DiscordChannelListItem } from "@vertix.gg/discord-ui";

const AVATAR = ( index: number ) => `https://cdn.discordapp.com/embed/avatars/${ index }.png`;

const EXTRA_MEMBERS = {
    sam: { id: "sam", username: "Sam", avatar: AVATAR( 4 ) },
    rin: { id: "rin", username: "Rin", avatar: AVATAR( 5 ) },
};

/** The generator on its own, before anybody has walked into it. */
const EMPTY_SERVER: DiscordChannelListItem[] = [
    { id: "generator", name: "＋ New Channel" },
];

/**
 * The same list once three people have used it.
 *
 * Three rooms rather than one, because a single demonstration channel reads as a feature and a
 * list of them reads as an evening - which is the thing being described. Each belongs to whoever
 * walked into the generator, and carries the people who followed them in.
 */
const BUSY_SERVER: DiscordChannelListItem[] = [
    { id: "generator", name: "＋ New Channel" },
    {
        id: "owner-channel",
        name: DEMO_CHANNEL_NAME,
        active: true,
        userCount: 2,
        maxUsers: 5,
        timer: "12:41",
        users: [ DEMO_MEMBERS.owner, DEMO_MEMBERS.alex ],
    },
    {
        id: "jordan-channel",
        name: "Jordan's Channel",
        userCount: 3,
        maxUsers: 4,
        users: [ DEMO_MEMBERS.jordan, DEMO_MEMBERS.mia, EXTRA_MEMBERS.rin ],
    },
    {
        id: "sam-channel",
        name: "Sam's Channel",
        locked: true,
        userCount: 1,
        maxUsers: 2,
        users: [ EXTRA_MEMBERS.sam ],
    },
];

const CHANNEL_CHATTER = [
    {
        id: "1",
        author: "Alex",
        avatar: DEMO_MEMBERS.alex.avatar,
        time: "Today at 10:53 AM",
        text: "how did Sam lock theirs?",
    },
    {
        id: "2",
        author: DEMO_OWNER,
        avatar: DEMO_MEMBERS.owner.avatar,
        time: "Today at 10:54 AM",
        text: "the privacy button up there — it's their room, they decide",
    },
] as const;

const goToInvite = () => {
    window.location.href = "/invite-vertix";
};

export default function JoinToCreate() {
    const openFeature = useOpenDynamicChannelV3Feature();

    return (
        <div className="vc-container vc-page-panel">
            <h1 className="text-h4">Join to Create voice channels in Discord</h1>

            <p className="text-vc-ice-dim mt-4">
                One channel hands out the rest. Somebody joins it, gets a room of their own, and
                the room disappears when they leave.
            </p>

            <h2 className="text-h5 mt-10 mb-3">You keep one channel</h2>

            <p className="text-vc-ice-dim mb-6">
                Call it whatever you like. Nobody talks in it &mdash; joining is the whole point.
                This is the entire setup, and the only channel that stays in your list permanently.
            </p>

            <div className="max-w-[320px]">
                <DiscordChannelList title="༄ Dynamic Channels" channels={ EMPTY_SERVER }/>
            </div>

            <h2 className="text-h5 mt-12 mb-3">An evening later</h2>

            <p className="text-vc-ice-dim mb-6">
                Three people walked into it and got three rooms. Each is named after whoever made
                it, each is theirs to run, and Sam locked hers. Nobody asked a moderator, and the
                generator is still sitting at the top waiting for the next person.
            </p>

            <div className="vc-landing-chat mb-6">
                <DiscordAppFrame
                    channelName={ DEMO_CHANNEL_NAME }
                    sidebar={
                        <DiscordChannelList
                            title="༄ Dynamic Channels"
                            collapsible={ true }
                            channels={ BUSY_SERVER }
                        />
                    }
                >
                    <div className="discord-chat-container m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 10:52 AM"
                            mentionUsername={ DEMO_OWNER }
                            componentName="VertixBot/UI-V3/DynamicChannel"
                            variables={ DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES }
                            onElementClick={ openFeature }
                        />

                        { CHANNEL_CHATTER.map( ( message ) => (
                            <DiscordMessage
                                key={ message.id }
                                author={ message.author }
                                avatar={ message.avatar }
                                timestamp={ message.time }
                                app={ false }
                            >
                                { message.text }
                            </DiscordMessage>
                        ) ) }
                    </div>
                </DiscordAppFrame>
            </div>

            <p className="text-vc-ice-dim">
                The panel above is the real one, and every button on it goes somewhere &mdash;
                press one to read what it does. When the last person leaves a room it is deleted,
                so the list only ever shows channels somebody is actually sitting in.
            </p>

            <p className="text-vc-ice-dim">
                Any of those buttons can be{ " " }
                <a href="/posts/enable-features">switched off per server</a>, and the set can
                differ by role, so members get the controls you want them to have and nothing else.
            </p>

            <h2 className="text-h5 mt-12 mb-3">Setting it up</h2>

            <p className="text-vc-ice-dim mb-6">
                Add the bot and run <code>/setup</code>. Pick the channel that should do the
                handing out, and that is it.
            </p>

            <DiscordCommandSuggestion
                searchTerm="/setup"
                items={ [ {
                    command: "/setup",
                    description: "Displaying VoiceChannels setup wizard in ephemeral mode.",
                    botName: "VoiceChannels",
                    botAvatar: VertixAvatar,
                } ] }
            />

            <p className="text-vc-ice-dim mt-6 mb-0">
                The step-by-step version is in the{ " " }
                <a href="/posts/how-to-setup">setup guide</a>. Afterwards, name the generated
                channels with{ " " }
                <a href="/posts/channel-name-placeholders">placeholders</a>, and if people start
                waiting for a free room, turn on{ " " }
                <a href="/features/auto-scaling">auto-scaling</a>.
            </p>

            <div className="p-6 mt-10 bg-vc-space rounded border border-vc-hairline-bright text-center">
                <h2 className="text-h5 mb-3">Try it on your server</h2>
                <p className="text-vc-ice-dim mb-6">
                    Two generators free, and set up with one command.
                </p>
                <button onClick={ goToInvite }
                    className="vc-btn vc-btn-primary vc-btn-lg vc-btn-effect">
                    Add to Discord
                </button>
            </div>
        </div>
    );
}
