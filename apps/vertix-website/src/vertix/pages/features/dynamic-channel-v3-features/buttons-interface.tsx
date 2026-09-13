import { DiscordUIComponentMessage, DiscordMessage, DiscordAppFrame } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import { useOpenDynamicChannelV3Feature } from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

import { DEMO_CHANNEL_NAME, DEMO_MEMBERS, DEMO_OWNER, DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";
import { DynamicChannelV3Sidebar } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-sidebar";

const CHANNEL_MEMBERS = [ DEMO_MEMBERS.owner, DEMO_MEMBERS.alex, DEMO_MEMBERS.jordan ];

/**
 * The room talking around the panel.
 *
 * The panel is a message in a channel like any other, and shown on its own it reads as a control
 * surface floating in nothing. A couple of lines either side of it put it back where it lives.
 */
const CHANNEL_CHATTER = [
    { id: "1", author: "Alex", avatar: DEMO_MEMBERS.alex.avatar,
        time: "Today at 10:53 AM", text: "wait, we can rename it ourselves?" },
    { id: "2", author: DEMO_OWNER, avatar: DEMO_MEMBERS.owner.avatar,
        time: "Today at 10:54 AM", text: "yep — it's all in the panel up there" }
];

export default function ButtonsInterface() {
    const openFeature = useOpenDynamicChannelV3Feature();

    return (
        <div className="mb-12">
            <div className="flex items-center mb-4">
                <span className="text-h2 mr-4">🎚️</span>
                <h3 className="mb-0">Buttons Interface</h3>
            </div>
            <div className="grid grid-cols-12 gap-12 items-center">
                <div className="col-span-12">
                    <div className="mb-6">
                        <DiscordAppFrame
                            sidebar={
                                <DynamicChannelV3Sidebar
                                    channel={ {
                                        name: DEMO_CHANNEL_NAME,
                                        active: true,
                                        userCount: 3,
                                        maxUsers: 5,
                                        timer: "26:08",
                                        users: CHANNEL_MEMBERS
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
                    <div className="text-h5 text-vc-ice-dim">
                        <ul className="text-left inline-block">
                            <li><strong>The buttons interface is located inside the dynamic channel.</strong></li>
                            <li>Press a button above to read what it does.</li>
                            <li>You can access it by opening the chat box of the dynamic channel.</li>
                            <li>You can modify the buttons using <code>/setup</code> command.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
