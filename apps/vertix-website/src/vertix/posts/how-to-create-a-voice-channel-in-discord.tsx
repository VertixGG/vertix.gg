import { DiscordAppFrame, DiscordCommandSuggestion, DiscordMessage, DiscordUIComponentMessage } from "@vertix.gg/discord-ui";

import VertixAvatar from "@vertix.gg/assets/brand/vc-avatar.png";

import { DynamicChannelV3Sidebar } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-sidebar";
import { useOpenDynamicChannelV3Feature } from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

import {
    DEMO_CHANNEL_NAME,
    DEMO_MEMBERS,
    DEMO_OWNER,
    DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES
} from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";

const DESKTOP_STEPS = [
    "Find the category you want the channel to sit under in the left-hand channel list.",
    "Hover it and press the + that appears, or right-click the category and choose Create Channel.",
    "Pick Voice as the channel type - Discord defaults to Text, so this is the step people miss.",
    "Give it a name, and switch on Private Channel if only certain roles should see it.",
    "Press Create Channel. It appears in the list straight away and anyone with access can join it.",
] as const;

const MOBILE_STEPS = [
    "Open the server and swipe right to show the channel list.",
    "Tap the + beside a category name, or open the server menu and choose Create Channel.",
    "Choose Voice, name it, and create it.",
] as const;

const AFTERWARDS = [
    {
        title: "User limit",
        body: "Edit Channel, then Overview. Setting a limit stops a room filling past the number "
            + "you pick, which is how people keep a duo channel a duo channel.",
    },
    {
        title: "Region override",
        body: "Also under Overview. Discord picks a voice server automatically; overriding it "
            + "helps when a group is spread across continents.",
    },
    {
        title: "Permissions",
        body: "Edit Channel, then Permissions. This is where you decide which roles can see the "
            + "channel, connect to it, and speak in it.",
    },
] as const;

const CHANNEL_CHATTER = [
    {
        id: "1",
        author: "Alex",
        avatar: DEMO_MEMBERS.alex.avatar,
        time: "Today at 10:53 AM",
        text: "did you have to ask a mod to make this?",
    },
    {
        id: "2",
        author: DEMO_OWNER,
        avatar: DEMO_MEMBERS.owner.avatar,
        time: "Today at 10:54 AM",
        text: "nope, it made itself when I joined the one above",
    },
] as const;

const goToInvite = () => {
    window.location.href = "/invite-vertix";
};

export default function HowToCreateAVoiceChannelInDiscord() {
    const openFeature = useOpenDynamicChannelV3Feature();

    return (
        <div className="vc-container vc-page-panel">
            <h1 className="text-h4">How to create a voice channel in Discord</h1>

            <p className="text-vc-ice-dim mt-4">
                You need the <strong>Manage Channels</strong> permission on the server. Server
                owners have it already; everyone else needs a role that grants it, which is why
                most members cannot make their own channel and have to ask.
            </p>

            <h2 className="text-h5 mt-10 mb-3">On desktop</h2>
            <ol className="text-vc-ice-dim">
                { DESKTOP_STEPS.map( ( step ) => (
                    <li key={ step } className="mb-2">{ step }</li>
                ) ) }
            </ol>

            <h2 className="text-h5 mt-10 mb-3">On mobile</h2>
            <ol className="text-vc-ice-dim">
                { MOBILE_STEPS.map( ( step ) => (
                    <li key={ step } className="mb-2">{ step }</li>
                ) ) }
            </ol>

            <h2 className="text-h5 mt-10 mb-3">Settings worth changing afterwards</h2>
            <div className="grid gap-4 md:grid-cols-3">
                { AFTERWARDS.map( ( item ) => (
                    <div key={ item.title }
                        className="p-4 bg-vc-space rounded border border-vc-hairline-bright h-full">
                        <h3 className="text-h6 text-vc-cyan mb-1">{ item.title }</h3>
                        <p className="text-vc-ice-dim mb-0 text-sm">{ item.body }</p>
                    </div>
                ) ) }
            </div>

            <h2 className="text-h5 mt-12 mb-3">Where this approach runs out</h2>

            <p className="text-vc-ice-dim">
                A channel made this way is permanent. It sits in the list whether anyone is in it
                or not, and only somebody with Manage Channels can add another one or clear the old
                ones away.
            </p>

            <p className="text-vc-ice-dim">
                That leaves most servers choosing between two bad options. Keep a handful of voice
                channels, and on a busy night there is nowhere private to go. Keep a lot of them,
                and the channel list turns into a wall of empty rooms nobody uses - with the few
                active ones buried somewhere in it.
            </p>

            <h2 className="text-h5 mt-12 mb-3">Channels that create and delete themselves</h2>

            <p className="text-vc-ice-dim mb-6">
                Here is the same server with a bot doing it instead. One generator sits in the list
                permanently - <code>＋ New Channel</code> - and joining it made the room below it.
                The person it was made for owns it, and the panel is theirs. Press a button to see
                what it does.
            </p>

            <div className="vc-landing-chat mb-6">
                <DiscordAppFrame
                    channelName={ DEMO_CHANNEL_NAME }
                    sidebar={
                        <DynamicChannelV3Sidebar
                            channel={ {
                                name: DEMO_CHANNEL_NAME,
                                active: true,
                                userCount: 2,
                                maxUsers: 5,
                                timer: "12:41",
                                users: [ DEMO_MEMBERS.owner, DEMO_MEMBERS.alex ]
                            } }
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
                Nobody needed Manage Channels for that, and when the last person leaves the room is
                deleted. The list only ever shows channels somebody is actually in.
            </p>

            <h2 className="text-h5 mt-12 mb-3">Setting it up</h2>

            <p className="text-vc-ice-dim mb-6">
                Add the bot and run <code>/setup</code>. Pick the channel that should do the handing
                out, and that is it.
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

            <p className="text-vc-ice-dim mt-6">
                The step-by-step version is in the{ " " }
                <a href="/posts/how-to-setup">setup guide</a>.
            </p>

            <div className="p-6 mt-10 bg-vc-space rounded border border-vc-hairline-bright text-center">
                <h2 className="text-h5 mb-3">Stop making voice channels by hand</h2>
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
